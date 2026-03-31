
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
      const receipt = `rcpt_${userId.substring(0, 8)}_${Date.now()}`;
      const options = {
        amount: amount * 100, // amount in the smallest currency unit
        currency: 'INR',
        receipt,
      };
      const order = await this.razorpay.orders.create(options);

      // Verify user exists first to prevent foreign key constraint failure
      const user = await this.prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new UnauthorizedException('User not found. Please log in again.');
      }

      // Create a pending payment record
      await this.prisma.paymentOrder.create({
        data: {
          userId,
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
      if (error.status === 401) {
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

      // Update User Wallet Balance and create transaction
      const paymentOrder = await this.prisma.paymentOrder.findUnique({
        where: { razorpayOrderId },
      });

      if (paymentOrder && paymentOrder.status === 'SUCCESS') {
        // Atomic update of user's wallet
        await this.prisma.user.update({
          where: { id: userId },
          data: {
            walletBalance: {
              increment: paymentOrder.amount,
            },
          },
        });

        // Log the transaction
        await this.prisma.walletTransaction.create({
          data: {
            userId,
            amount: paymentOrder.amount,
            type: 'RECHARGE',
            status: 'COMPLETED',
            referenceId: paymentOrder.id,
            description: `Recharged ₹${paymentOrder.amount} via Razorpay`,
          },
        });
      }

      // Update the user's organization to premium if it's a fixed amount (optional logic)
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { organization: true },
      });

      if (user && user.organizationId && paymentOrder && Number(paymentOrder.amount) >= 1000) {
        await this.prisma.organization.update({
          where: { id: user.organizationId },
          data: {
            isPremium: true,
            subscriptionMode: 'PAID',
          }
        });
      }

      return { 
        status: 'success', 
        message: 'Payment verified and wallet updated.',
        newBalance: user?.walletBalance ? Number(user.walletBalance) + Number(paymentOrder?.amount || 0) : 0
      };
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
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { walletBalance: true },
    });
    return { balance: user?.walletBalance || 0 };
  }

  async getWalletTransactions(userId: string) {
    return this.prisma.walletTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  async deductFromWallet(userId: string, amount: number, type: string, description: string, referenceId?: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { walletBalance: true },
    });

    if (!user || user.walletBalance.toNumber() < amount) {
      throw new InternalServerErrorException('Insufficient wallet balance');
    }

    // Atomic deduction
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
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
        amount: -amount,
        type,
        status: 'COMPLETED',
        referenceId,
        description,
      },
    });

    return updatedUser.walletBalance;
  }
}
