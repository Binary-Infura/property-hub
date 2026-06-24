import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';

@Injectable()
export class PostalCodesService {
    private readonly apiKey: string;
    private readonly apiUrl = 'https://api.data.gov.in/resource/5c2f62fe-5afa-4119-a499-fec9d604d5bd';
    private syncProgress = {
        isSyncing: false,
        lastOffset: 0,
        total: 0,
        imported: 0,
        error: null as string | null,
        logId: null as string | null
    };

    constructor(
        private prisma: PrismaService,
        private configService: ConfigService,
        private activityLogsService: ActivityLogsService
    ) {
        this.apiKey = this.configService.get<string>('DATA_GOV_IN_API_KEY');
    }

    getSyncProgress() {
        return this.syncProgress;
    }

    async getSyncLogs(limit: number = 20) {
        return (this.prisma as any).postalCodeSyncLog.findMany({
            take: Number(limit),
            orderBy: { startedAt: 'desc' },
        });
    }

    async findAll(page: number = 1, limit: number = 20, search?: string) {
        const skip = (page - 1) * limit;

        const where: any = search ? {
            OR: [
                { code: { contains: search, mode: 'insensitive' } },
                { officeName: { contains: search, mode: 'insensitive' } },
                { district: { contains: search, mode: 'insensitive' } },
                { stateName: { contains: search, mode: 'insensitive' } },
                { city: { contains: search, mode: 'insensitive' } },
            ],
        } : {};

        try {
            const [items, total] = await Promise.all([
                (this.prisma as any).postalCode.findMany({
                    where,
                    skip: Number(skip),
                    take: Number(limit),
                    orderBy: { createdAt: 'desc' },
                }),
                (this.prisma as any).postalCode.count({ where }),
            ]);

            return {
                items,
                meta: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                },
            };
        } catch (error) {
            console.error('Error fetching postal codes:', error);
            throw error;
        }
    }

    async findByCode(code: string) {
        try {
            return await (this.prisma as any).postalCode.findFirst({
                where: {
                    code: {
                        equals: code,
                        mode: 'insensitive',
                    },
                },
            });
        } catch (error) {
            console.error('Error finding postal code:', error);
            throw error;
        }
    }

    async syncFromApi(offset: number = 0, limit: number = 100) {
        try {
            if (!this.apiKey) {
                throw new Error('DATA_GOV_IN_API_KEY is not configured');
            }

            const response = await axios.get(this.apiUrl, {
                params: {
                    'api-key': this.apiKey,
                    format: 'json',
                    offset,
                    limit,
                },
            });

            const records = response.data.records;
            if (!records || records.length === 0) {
                return { imported: 0, total: response.data.total, status: 'no_records' };
            }

            const operations = records.map((record: any) => {
                return (this.prisma as any).postalCode.upsert({
                    where: {
                        code_officeName: {
                            code: record.pincode.toString(),
                            officeName: record.officename,
                        },
                    },
                    update: {
                        circleName: record.circlename,
                        regionName: record.regionname,
                        divisionName: record.divisionname,
                        officeType: record.officetype,
                        delivery: record.delivery,
                        district: record.district,
                        stateName: record.statename,
                        latitude: record.latitude !== 'NA' ? record.latitude : null,
                        longitude: record.longitude !== 'NA' ? record.longitude : null,
                    },
                    create: {
                        code: record.pincode.toString(),
                        officeName: record.officename,
                        circleName: record.circlename,
                        regionName: record.regionname,
                        divisionName: record.divisionname,
                        officeType: record.officetype,
                        delivery: record.delivery,
                        district: record.district,
                        stateName: record.statename,
                        latitude: record.latitude !== 'NA' ? record.latitude : null,
                        longitude: record.longitude !== 'NA' ? record.longitude : null,
                    },
                });
            });

            await Promise.all(operations);

            return {
                imported: records.length,
                total: response.data.total,
                nextOffset: offset + limit,
                status: 'success',
            };
        } catch (error) {
            console.error('Error syncing postal codes:', error.message);
            throw error;
        }
    }

    async startFullSync(userId?: string) {
        if (this.syncProgress.isSyncing) {
            return { message: 'Sync already in progress', progress: this.syncProgress };
        }

        // Create persistent log entry
        const log = await (this.prisma as any).postalCodeSyncLog.create({
            data: {
                status: 'IN_PROGRESS',
                startedById: userId,
            }
        });

        this.syncProgress = {
            isSyncing: true,
            lastOffset: 0,
            total: 0,
            imported: 0,
            error: null,
            logId: log.id
        };

        // Log initiation in ActivityLog
        await this.activityLogsService.log({
            userId,
            type: 'info',
            action: 'Postal Code Sync Started',
            target: 'All India Directory',
            details: { logId: log.id }
        });

        // Run in background
        this.runFullSync(log.id).catch(err => {
            console.error('Full sync background error:', err);
            this.syncProgress.error = err.message;
            this.syncProgress.isSyncing = false;
        });

        return { message: 'Full sync started', progress: this.syncProgress };
    }

    private async runFullSync(logId: string) {
        const batchSize = 1000;
        let offset = 0;
        let hasMore = true;

        try {
            while (hasMore) {
                const result = await this.syncFromApi(offset, batchSize);
                this.syncProgress.total = result.total;
                this.syncProgress.imported += result.imported;
                this.syncProgress.lastOffset = offset;

                // Update persistent log
                await (this.prisma as any).postalCodeSyncLog.update({
                    where: { id: logId },
                    data: {
                        recordsImported: this.syncProgress.imported,
                        totalRecords: result.total,
                        lastOffset: offset
                    }
                });

                if (result.imported === 0 || offset + batchSize >= result.total) {
                    hasMore = false;
                } else {
                    offset += batchSize;
                }

                // Small delay to avoid hitting rate limits too hard
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            // Mark completed
            await (this.prisma as any).postalCodeSyncLog.update({
                where: { id: logId },
                data: {
                    status: 'COMPLETED',
                    completedAt: new Date(),
                }
            });

            await this.activityLogsService.log({
                type: 'info',
                action: 'Postal Code Sync Completed',
                target: 'All India Directory',
                details: { imported: this.syncProgress.imported }
            });

        } catch (error) {
            console.error(`Error at offset ${offset}:`, error.message);
            this.syncProgress.error = error.message;

            await (this.prisma as any).postalCodeSyncLog.update({
                where: { id: logId },
                data: {
                    status: 'FAILED',
                    error: error.message,
                    completedAt: new Date(),
                }
            });

            await this.activityLogsService.log({
                type: 'alert',
                action: 'Postal Code Sync Failed',
                target: 'All India Directory',
                details: { error: error.message, lastOffset: offset }
            });
        } finally {
            this.syncProgress.isSyncing = false;
        }
    }
}
