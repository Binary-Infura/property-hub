import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import { CallingProvider, CallParams, CallResponse, CallProviderType } from './calling.types';
import { ExotelBusinessProvider } from './providers/exotel.provider';
import { KnowlarityProvider } from './providers/knowlarity.provider';
import { TwilioProvider } from './providers/twilio.provider';

@Injectable()
export class CallingService {
    private readonly logger = new Logger(CallingService.name);
    private providers: Map<CallProviderType, CallingProvider> = new Map();

    constructor(
        private configService: ConfigService,
        private prisma: PrismaService,
        private exotel: ExotelBusinessProvider,
        private knowlarity: KnowlarityProvider,
        private twilio: TwilioProvider,
    ) {
        this.providers.set(CallProviderType.EXOTEL, exotel);
        this.providers.set(CallProviderType.KNOWLARITY, knowlarity);
        this.providers.set(CallProviderType.TWILIO, twilio);
    }

    async initiateCall(params: CallParams): Promise<CallResponse> {
        const { consultantId, leadId, from, to } = params;

        // 1. Check organization wallet balance
        const consultant = await this.prisma.user.findUnique({
            where: { id: consultantId },
            include: { organization: true }
        });

        if (!consultant?.organizationId) {
            throw new BadRequestException('Consultant must belong to an organization to initiate calls.');
        }

        if (Number(consultant.organization?.walletBalance || 0) < 10) {
            throw new BadRequestException('Insufficient organizational wallet balance to start a call. Minimum ₹10 required.');
        }

        // 2. Select Provider
        const providerType = this.configService.get<CallProviderType>('DEFAULT_CALL_PROVIDER', CallProviderType.EXOTEL);
        const provider = this.providers.get(providerType);

        if (!provider) {
            throw new InternalServerErrorException(`Provider ${providerType} not configured`);
        }

        this.logger.log(`Initiating call using ${providerType} for lead ${leadId}`);

        // 3. Make the call
        const response = await provider.makeCall(params);

        if (response.success) {
            // 4. Log the call
            await this.prisma.callLog.create({
                data: {
                    sid: response.sid,
                    leadId,
                    consultantId,
                    status: 'queued',
                },
            });
        }

        return response;
    }

    async handleProviderWebhook(provider: CallProviderType, data: any) {
        let sid: string;
        let status: string;
        let duration: number;
        let recordingUrl: string;

        if (provider === CallProviderType.EXOTEL) {
            sid = data.CallSid;
            status = data.Status;
            duration = data.RecordingDuration ? parseInt(data.RecordingDuration) : 0;
            recordingUrl = data.RecordingUrl;
        } else if (provider === CallProviderType.TWILIO) {
            sid = data.CallSid;
            status = data.CallStatus;
            duration = data.CallDuration ? parseInt(data.CallDuration) : 0;
            recordingUrl = data.RecordingUrl;
        } else if (provider === CallProviderType.KNOWLARITY) {
            sid = data.call_id || data.request_id;
            status = data.status;
            duration = data.duration ? parseInt(data.duration) : 0;
            recordingUrl = data.recording_url;
        }

        if (!sid) return;

        // Update call log
        const callLog = await this.prisma.callLog.updateMany({
            where: { sid },
            data: {
                status,
                recordingUrl,
                duration,
                endTime: status === 'completed' ? new Date() : undefined
            }
        });

        // Deduct from wallet if completed
        if (status === 'completed' && duration > 0) {
            const durationInMinutes = Math.ceil(duration / 60);
            const costPerMinute = 2; // Default ₹2/min
            const totalCost = durationInMinutes * costPerMinute;

            const log = await this.prisma.callLog.findUnique({
                where: { sid }
            });

            if (log && log.consultantId) {
                const user = await this.prisma.user.findUnique({
                    where: { id: log.consultantId },
                    select: { organizationId: true }
                });

                if (user?.organizationId) {
                    await this.prisma.organization.update({
                        where: { id: user.organizationId },
                        data: {
                            walletBalance: { decrement: totalCost }
                        }
                    });

                    await this.prisma.walletTransaction.create({
                        data: {
                            userId: log.consultantId,
                            organizationId: user.organizationId,
                            amount: -totalCost,
                            type: 'CALL_COST',
                            description: `Call charge (${provider}): ${durationInMinutes} min (SID: ${sid})`,
                            referenceId: log.id
                        }
                    });
                }
            }
        }
    }

    async syncCallDetails(sid: string) {
        const providerType = this.configService.get<CallProviderType>('DEFAULT_CALL_PROVIDER', CallProviderType.EXOTEL);
        const provider = this.providers.get(providerType);
        if (!provider) return null;
        return provider.getCallDetails(sid);
    }
}
