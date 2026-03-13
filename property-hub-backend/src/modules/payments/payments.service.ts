import { Injectable, InternalServerErrorException } from '@nestjs/common';
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
      key_id: this.configService.get<string>('RAZORPAY_KEY_ID') || 'rzp_test_RENvNtOLr6vA5o',
      key_secret: this.configService.get<string>('RAZORPAY_KEY_SECRET') || 'BoZ3n6GdtlNBKBIAhSLF10Q0',
    });
  }

  async createOrder(userId: string, amount: number) {
    try {
      const options = {
        amount: amount * 100, // amount in the smallest currency unit
        currency: 'INR',
        receipt: `receipt_order_${userId}_${Date.now()}`,
      };
      const order = await this.razorpay.orders.create(options);
      return order;
    } catch (error) {
      console.error('Error creating order:', error);
      throw new InternalServerErrorException('Error creating Razorpay order');
    }
  }

  async verifyPayment(
    userId: string,
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string,
  ) {
    const keySecret = this.configService.get<string>('RAZORPAY_KEY_SECRET');
    const body = razorpayOrderId + '|' + razorpayPaymentId;

    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature === razorpaySignature) {
      // Payment is verified
      // Update the user's organization to premium
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { organization: true },
      });

      if (user && user.organizationId) {
         await this.prisma.organization.update({
             where: { id: user.organizationId },
             data: {
                 isPremium: true,
                 subscriptionMode: 'PAID',
             }
         });
      }

      return { status: 'success', message: 'Payment verified and subscription activated.' };
    } else {
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
}
