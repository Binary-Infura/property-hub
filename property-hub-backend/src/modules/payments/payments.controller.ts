import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Payments')
@Controller('api/payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('create-order')
  @ApiOperation({ summary: 'Create a Razorpay order for premium subscription' })
  async createOrder(
    @Req() req: any,
    @Body() body: { amount: number },
  ) {
    return this.paymentsService.createOrder(req.user.userId, body.amount || 1000); // Default to 1000 INR if not passed
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('verify')
  @ApiOperation({ summary: 'Verify a Razorpay payment' })
  async verifyPayment(
    @Req() req: any,
    @Body() body: {
      razorpayOrderId: string;
      razorpayPaymentId: string;
      razorpaySignature: string;
    },
  ) {
    return this.paymentsService.verifyPayment(
      req.user.userId,
      body.razorpayOrderId,
      body.razorpayPaymentId,
      body.razorpaySignature,
    );
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Razorpay Webhook for payment events' })
  async handleWebhook(@Req() req: any, @Body() body: any) {
    const signature = req.headers['x-razorpay-signature'];
    return this.paymentsService.handleWebhook(body, signature);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('wallet/balance')
  @ApiOperation({ summary: 'Get user wallet balance' })
  async getWalletBalance(@Req() req: any) {
    return this.paymentsService.getWalletBalance(req.user.userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('wallet/transactions')
  @ApiOperation({ summary: 'Get user wallet transactions' })
  async getWalletTransactions(@Req() req: any) {
    return this.paymentsService.getWalletTransactions(req.user.userId);
  }
}
