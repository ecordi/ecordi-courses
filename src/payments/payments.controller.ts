import { Controller, Post, Body, UseGuards, Req, Headers, Get, Query, HttpCode } from '@nestjs/common'
import { PaymentsService } from './payments.service'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { Throttle } from '@nestjs/throttler'
import { ApiBearerAuth, ApiBody, ApiHeader, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { CreateMpPreferenceDto } from './dto/mp-pref.dto'
import { CreatePaypalOrderDto } from './dto/pp-create.dto'
import { Logger } from '@nestjs/common'

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name)
  constructor(private readonly service: PaymentsService) {}

  @Post('mp/preferences')
  @UseGuards(JwtAuthGuard)
  @Throttle({ payments: { ttl: 60, limit: 20 } })
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear preferencia de Mercado Pago' })
  @ApiBody({ type: CreateMpPreferenceDto })
  @ApiOkResponse({
    description: 'Preferencia creada',
    schema: {
      example: {
        init_point: 'https://www.mercadopago.com/init/checkout?pref_id=123',
        preferenceId: '123',
        external_reference: 'b1ad8e3c-d3e5-4f6a-8b9c-1234567890ab',
      },
    },
  })
  async mpPref(@Req() req: any, @Body() body: CreateMpPreferenceDto) {
    return this.service.createMpPreference(req.user.userId, body.courseId)
  }

  @Post('mp/webhook')
  @HttpCode(200)
  @ApiOperation({ summary: 'Webhook de Mercado Pago' })
  @ApiHeader({ name: 'x-signature', description: 'Firma de webhook de MP', required: false })
  @ApiOkResponse({ schema: { example: { ok: true, verified: true } } })
  async mpWebhook(
    @Headers('x-signature') signature: string,
    @Headers('x-request-id') requestId: string,
    @Headers() headers: any,
    @Body() body: any,
    @Query() query: any
  ) {
    // dataId puede llegar en query (merchant_order) o query["data.id"] (payment) o en body.data.id
    const dataId =
      (query?.id as string) ||
      (query?.['data.id'] as string) ||
      (body?.data?.id as string) ||
      (body?.data?.payment?.id as string) ||
      (body?.resource as string) ||
      (body?.['data.id'] as string) ||
      ''
      const shouldLog = process.env.MP_LOG_WEBHOOK === '1'
      if (shouldLog) {
        const ts = (signature || '')
          .split(',')
          .map((s) => s.trim())
          .find((p) => p.startsWith('ts='))
          ?.slice(3) || ''
        const maskedSig = (signature || '').replace(
          /v1=([0-9a-f]{64})/i,
          (_m, g1) => `v1=${g1.slice(0, 6)}...${g1.slice(-6)}`,
        )
        const shortReq = requestId ? `${requestId.slice(0, 8)}...` : ''
        const topic = (query?.topic as string) || (body?.type as string) || ''
        this.logger.log(`mp.webhook topic=${topic} dataId=${dataId} reqId=${shortReq} ts=${ts} sig=${maskedSig}`)
      }
    return this.service.handleMpWebhook(signature, requestId, dataId, headers, body)
  }

  @Post('pp/create-order')
  @UseGuards(JwtAuthGuard)
  @Throttle({ payments: { ttl: 60, limit: 20 } })
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear orden de PayPal' })
  @ApiBody({ type: CreatePaypalOrderDto })
  @ApiOkResponse({
    description: 'Orden creada',
    schema: {
      example: {
        orderId: '5O190127TN364715T',
        approveUrl: 'https://www.paypal.com/checkoutnow?token=5O190127TN364715T',
        external_reference: 'b1ad8e3c-d3e5-4f6a-8b9c-1234567890ab',
      },
    },
  })
  async ppCreate(@Req() req: any, @Body() body: CreatePaypalOrderDto) {
    return this.service.createPaypalOrder(req.user.userId, body.courseId)
  }

  @Post('pp/webhook')
  @ApiOperation({ summary: 'Webhook de PayPal' })
  @ApiOkResponse({ schema: { example: { ok: true } } })
  async ppWebhook(@Req() req: any) {
    console.log("🚀 ~ file: payments.controller.ts:99 ~ body:", JSON.stringify(req.body))
    console.log("🚀 ~ file: payments.controller.ts:99 ~ headers:", JSON.stringify(req.headers)
  )
    return this.service.handlePaypalWebhook(req.headers, req.body)
  }

  @Get('success')
  @ApiOperation({ summary: 'Resultado de pago exitoso (Mercado Pago back_url)' })
  @ApiOkResponse({ schema: { example: { ok: true, status: 'success' } } })
  success() { return { ok: true, status: 'success' } }

  @Get('failure')
  @ApiOperation({ summary: 'Resultado de pago fallido (Mercado Pago back_url)' })
  @ApiOkResponse({ schema: { example: { ok: true, status: 'failure' } } })
  failure() { return { ok: true, status: 'failure' } }

  @Get('pending')
  @ApiOperation({ summary: 'Resultado de pago pendiente (Mercado Pago back_url)' })
  @ApiOkResponse({ schema: { example: { ok: true, status: 'pending' } } })
  pending() { return { ok: true, status: 'pending' } }
}
