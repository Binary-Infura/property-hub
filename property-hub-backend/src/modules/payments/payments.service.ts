
import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Razorpay from 'razorpay';
import * as crypto from 'crypto';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class PaymentsService {
  private razorpay: any;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.razorpay = new Razorpay({
      key_id: this.configService.get<string>('RAZORPAY_KEY_ID'),
      key_secret: this.configService.get<string>('RAZORPAY_KEY_SECRET'),
    });
  }

  async createOrder(userId: string, amount: number) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { organization: true }
      });

      if (!user) {
        throw new UnauthorizedException('User not found. Please log in again.');
      }

      if (!user.organizationId) {
        throw new UnauthorizedException('User must belong to an organization to use wallet features.');
      }

      const receipt = `rcpt_${userId.substring(0, 8)}_${Date.now()}`;
      const options = {
        amount: amount * 100, // amount in the smallest currency unit
        currency: 'INR',
        receipt,
      };
      const order = await this.razorpay.orders.create(options);

      // Create a pending payment record
      await this.prisma.paymentOrder.create({
        data: {
          userId,
          organizationId: user.organizationId,
          amount,
          currency: 'INR',
          status: 'PENDING',
          razorpayOrderId: order.id,
          receipt,
        },
      });

      return order;
    } catch (error) {
      console.error('Error creating order:', error);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('Error creating Razorpay order');
    }
  }

  async verifyPayment(
    userId: string,
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string,
  ) {
    const keySecret = this.configService.get<string>('RAZORPAY_KEY_SECRET') || 'BoZ3n6GdtlNBKBIAhSLF10Q0';
    const body = razorpayOrderId + '|' + razorpayPaymentId;

    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature === razorpaySignature) {
      // Payment is verified
      // Update Payment record
      try {
        await this.prisma.paymentOrder.update({
          where: { razorpayOrderId },
          data: {
            status: 'SUCCESS',
            razorpayPaymentId,
            razorpaySignature,
          },
        });
      } catch (e) {
        console.warn('Payment record not found for orderId:', razorpayOrderId);
      }

      // Update Organization Wallet Balance and create transaction
      const paymentOrder = await this.prisma.paymentOrder.findUnique({
        where: { razorpayOrderId },
      });

      if (paymentOrder && paymentOrder.status === 'SUCCESS' && paymentOrder.organizationId) {
        // Atomic update of organization's wallet
        await this.prisma.organization.update({
          where: { id: paymentOrder.organizationId },
          data: {
            walletBalance: {
              increment: paymentOrder.amount,
            },
            isPremium: Number(paymentOrder.amount) >= 1000 ? true : undefined,
            subscriptionMode: Number(paymentOrder.amount) >= 1000 ? 'PAID' : undefined,
          },
        });

        // Log the transaction
        await this.prisma.walletTransaction.create({
          data: {
            userId,
            organizationId: paymentOrder.organizationId,
            amount: paymentOrder.amount,
            type: 'RECHARGE',
            status: 'COMPLETED',
            referenceId: paymentOrder.id,
            description: `Recharged ₹${paymentOrder.amount} via Razorpay`,
          },
        });

        const org = await this.prisma.organization.findUnique({
          where: { id: paymentOrder.organizationId },
          select: { walletBalance: true }
        });

        return { 
          status: 'success', 
          message: 'Payment verified and wallet updated.',
          newBalance: org?.walletBalance ? Number(org.walletBalance) : 0
        };
      }
      
      throw new InternalServerErrorException('Payment order not found or invalid');
    } else {
      // Update Payment record to FAILED
      try {
        await this.prisma.paymentOrder.update({
          where: { razorpayOrderId },
          data: {
            status: 'FAILED',
            razorpayPaymentId,
            razorpaySignature,
          },
        });
      } catch (e) {
        // ignore
      }
      throw new InternalServerErrorException('Invalid Payment Signature');
    }
  }




  async handleWebhook(body: any, signature: string) {
    const webhookSecret = this.configService.get<string>('RAZORPAY_WEBHOOK_SECRET');
    if (!webhookSecret) {
      console.warn('RAZORPAY_WEBHOOK_SECRET is not configured');
      return { status: 'ignored' };
    }

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(body))
      .digest('hex');

    if (expectedSignature !== signature) {
      throw new InternalServerErrorException('Invalid Webhook Signature');
    }

    if (body.event === 'payment.captured' || body.event === 'order.paid') {
      // Since the webhook payload might not have userId directly if we didn't use notes,
      // we might need to rely on the frontend verifyPayment call for real-time unlock.
      // For a robust system, we would store the standard `order_id` -> `userId` in db and look it up here.
      console.log('Payment captured via webhook:', body.payload.payment.entity.id);
    }

    return { status: 'ok' };
  }

  async getWalletBalance(userId: string) {
    let user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { 
        organization: true,
        onboardedBy: { include: { organization: true } }
      },
    });

    // 1. Direct organization link
    if (user?.organizationId && user.organization) {
      return { balance: Number(user.organization.walletBalance || 0) };
    }

    // 2. Onboarder's organization link (Consultant fallback)
    if (user?.onboardedBy?.organizationId && user.onboardedBy.organization) {
      return { balance: Number(user.onboardedBy.organization.walletBalance || 0) };
    }

    // 3. Recursive lookup if needed (multi-level onboarding)
    let currentUser = user;
    let depth = 0;
    while (currentUser?.onboardedById && !currentUser.organizationId && depth < 3) {
      currentUser = await this.prisma.user.findUnique({
        where: { id: currentUser.onboardedById },
        include: { 
          organization: true,
          onboardedBy: { include: { organization: true } }
        }
      });
      if (currentUser?.organizationId && currentUser.organization) {
        return { balance: Number(currentUser.organization.walletBalance || 0) };
      }
      depth++;
    }

    return { balance: 0 };
  }

  async getWalletTransactions(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { organizationId: true }
    });

    if (!user?.organizationId) return [];

    return this.prisma.walletTransaction.findMany({
      where: { organizationId: user.organizationId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  async deductFromWallet(userId: string, amount: number, type: string, description: string, referenceId?: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { organization: true },
    });

    if (!user?.organizationId || !user.organization) {
      throw new InternalServerErrorException('User does not belong to an organization with a wallet');
    }

    if (user.organization.walletBalance.toNumber() < amount) {
      throw new InternalServerErrorException('Insufficient organizational wallet balance');
    }

    // Atomic deduction from organization
    const updatedOrg = await this.prisma.organization.update({
      where: { id: user.organizationId },
      data: {
        walletBalance: {
          decrement: amount,
        },
      },
    });

    // Log deduction
    await this.prisma.walletTransaction.create({
      data: {
        userId,
        organizationId: user.organizationId,
        amount: -amount,
        type,
        status: 'COMPLETED',
        referenceId,
        description,
      },
    });

    return updatedOrg.walletBalance;
  }
}
