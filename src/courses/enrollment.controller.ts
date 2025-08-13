import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { ApiBearerAuth, ApiOperation, ApiTags, ApiBody } from '@nestjs/swagger'
import { ObjectIdPipe } from '../common/pipes/objectid.pipe'
import { PaymentsService } from '../payments/payments.service'

@ApiTags('Enrollment')
@ApiBearerAuth()
@Controller('enrollment')
@UseGuards(JwtAuthGuard)
export class EnrollmentController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('courses/:courseId/enroll/mercadopago')
  @ApiOperation({ summary: 'Enroll in a course using MercadoPago' })
  async enrollWithMercadoPago(
    @Req() req: any,
    @Param('courseId', ObjectIdPipe) courseId: string
  ) {
    const userId = req.user.userId
    return this.paymentsService.createMpPreference(userId, courseId)
  }

  @Post('courses/:courseId/enroll/paypal')
  @ApiOperation({ summary: 'Enroll in a course using PayPal' })
  async enrollWithPayPal(
    @Req() req: any,
    @Param('courseId', ObjectIdPipe) courseId: string
  ) {
    const userId = req.user.userId
    return this.paymentsService.createPaypalOrder(userId, courseId)
  }

  @Get('courses/:courseId/payment-options')
  @ApiOperation({ summary: 'Get payment options for a course' })
  async getPaymentOptions(
    @Param('courseId', ObjectIdPipe) courseId: string
  ) {
    // Aquí podrías obtener opciones específicas para el curso
    // Por ahora devolvemos las opciones disponibles
    return {
      options: [
        {
          id: 'mercadopago',
          name: 'MercadoPago',
          description: 'Pagar con tarjeta de crédito, débito o efectivo',
          icon: 'mercadopago-icon.png'
        },
        {
          id: 'paypal',
          name: 'PayPal',
          description: 'Pagar con PayPal o tarjeta internacional',
          icon: 'paypal-icon.png'
        }
      ]
    }
  }
}
