import { Injectable, BadRequestException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { v4 as uuid } from 'uuid'
import { Payment, PaymentDocument } from '../db/schemas/payment.schema'
import { WebhookEvent, WebhookEventDocument } from '../db/schemas/webhook-event.schema'
import { EnrollmentsService } from '../enrollments/enrollments.service'
import { MpProvider } from './providers/mp.provider'
import { PayPalProvider } from './providers/paypal.provider'
import { Course, CourseDocument } from '../db/schemas/course.schema'

@Injectable()
export class PaymentsService {
  private mp: MpProvider
  private pp: PayPalProvider

  constructor(
    @InjectModel(Payment.name) private model: Model<PaymentDocument>,
    @InjectModel(WebhookEvent.name) private whModel: Model<WebhookEventDocument>,
    @InjectModel(Course.name) private courses: Model<CourseDocument>,
    private enrollments: EnrollmentsService,
  ) {
    this.mp = new MpProvider()
    this.pp = new PayPalProvider()
  }

  ping() { return { ok: true } }

  async createMpPreference(userId: string, courseId: string) {
    const course = await this.courses.findById(courseId)
    if (!course || course.status !== 'ACTIVE') throw new BadRequestException('Curso inválido')
    const title = course.title
    const amount = Number(course.priceUsd)
    const external_reference = uuid()
    const pref = await this.mp.createPreference({ title, amount, external_reference, metadata: { userId, courseId } })
    const pay = new this.model({
      userId: new Types.ObjectId(userId),
      courseId: new Types.ObjectId(courseId),
      provider: 'MP',
      externalId: external_reference,
      status: 'CREATED',
      amount,
      raw: { preferenceId: pref.id },
    })
    await pay.save()
    return { init_point: pref.init_point, preferenceId: pref.id, external_reference }
  }

  async createPaypalOrder(userId: string, courseId: string) {
    const course = await this.courses.findById(courseId)
    if (!course || course.status !== 'ACTIVE') throw new BadRequestException('Curso inválido')
    const amount = Number(course.priceUsd)
    const external_reference = uuid()
    const order = await this.pp.createOrder(amount, external_reference, courseId, userId)
    const pay = new this.model({
      userId: new Types.ObjectId(userId),
      courseId: new Types.ObjectId(courseId),
      provider: 'PAYPAL',
      externalId: order.id,
      status: 'CREATED',
      amount,
      raw: { approveUrl: order.approveUrl },
    })
    await pay.save()
    return { orderId: order.id, approveUrl: order.approveUrl, external_reference }
  }

  async handleMpWebhook(
    signature: string | undefined,
    requestId: string | undefined,
    dataId: string | undefined,
    headers: any,
    body: any,
  ) {
    const topic =
      String(body?.topic || body?.type || '').toLowerCase() ||
      (typeof headers?.['user-agent'] === 'string' &&
      headers['user-agent'].toLowerCase().includes('merchant_order')
        ? 'merchant_order'
        : '') ||
      (typeof headers?.['user-agent'] === 'string' &&
      headers['user-agent'].toLowerCase().includes('payment')
        ? 'payment'
        : '')

    // Guardamos eventos no-payment pero no los procesamos
    if (topic !== 'payment') {
      const eventId = headers?.['x-request-id'] || body?.id || body?.action || uuid()
      const exists = await this.whModel.findOne({ eventId })
      if (!exists) {
        await this.whModel.create({
          eventId,
          provider: 'MP',
          payload: { headers, body, queryId: dataId, topic: topic || 'unknown' },
        })
      }
      return { ok: true, ignored: true, topic: topic || 'unknown' }
    }

    const ok = this.mp.verifyWebhookSignature(signature, requestId, dataId)
    if (!ok) throw new BadRequestException('Firma inválida MP')

    // Idempotencia básica por eventId
    const eventId = headers['x-request-id'] || body.id || body.action || uuid()
    const already = await this.whModel.findOne({ eventId })
    if (!already) {
      await this.whModel.create({
        eventId,
        provider: 'MP',
        payload: { headers, body, queryId: dataId, topic: 'payment' },
      })
    }

    if (!dataId) return { ok: true }

    const fetched = await this.mp.getPayment(String(dataId))
    const status = (fetched as any).status as string
    const statusDetail = (fetched as any).status_detail as string
    const extRef = (fetched as any).external_reference as string
    const amount = Number((fetched as any).transaction_amount || 0)
    const refunded = Boolean((fetched as any).refunded || (fetched as any).status === 'refunded')

    // Aprobamos con estado general 'approved' (sin exigir detail = 'accredited')
    if (status === 'approved' && !refunded && extRef) {
      const meta = (fetched as any).metadata || {}
      const userId = meta.userId as string | undefined
      const courseId = meta.courseId as string | undefined

      const updated = await this.model.findOneAndUpdate(
        { provider: 'MP', externalId: extRef },
        { $set: { status: 'APPROVED', amount: amount || undefined, raw: fetched, statusDetail } },
        { new: true },
      )

      if (!updated) {
        // Si no existe el doc por algún motivo extraño, podés considerar upsert.
        console.warn('[MP] No encontré Payment por external_reference:', extRef)
      }

      if (userId && courseId) {
        await this.enrollments.activate(userId, courseId)
      }

      return { ok: true, verified: true }
    }

    if (status === 'rejected' && extRef) {
      await this.model.findOneAndUpdate(
        { provider: 'MP', externalId: extRef },
        { $set: { status: 'REJECTED', raw: fetched, statusDetail } },
        { new: true },
      )
      return { ok: true, verified: true }
    }

    return { ok: true, note: 'payment not final yet', status, statusDetail }
  }

  async handlePaypalWebhook(headers: any, body: any) {
    const verified = await this.pp.verifyWebhook(headers, body)
    console.log("🚀 ~ file: payments.service.ts:161 ~ verified:", verified)
    if (!verified) throw new BadRequestException('Firma inválida PayPal')

    const eventId = headers['paypal-transmission-id'] || body.id || uuid()
    const already = await this.whModel.findOne({ eventId })
    if (!already) await this.whModel.create({ eventId, provider: 'PAYPAL', payload: body })

    if (body.event_type === 'CHECKOUT.ORDER.APPROVED') {
      const orderId = body.resource?.id
      const custom = body.resource?.purchase_units?.[0]?.custom_id
      let userId = ''
      let courseId = ''
      try { const parsed = JSON.parse(custom || '{}'); userId = parsed.userId; courseId = parsed.courseId } catch {}
      await this.model.findOneAndUpdate(
        { externalId: orderId, provider: 'PAYPAL' },
        { $set: { status: 'APPROVED', raw: body } },
        { new: true },
      )
      if (userId && courseId) await this.enrollments.activate(userId, courseId)
      return { ok: true }
    }

    if (body.event_type === 'PAYMENT.CAPTURE.REFUNDED') {
      const orderId = body.resource?.supplementary_data?.related_ids?.order_id
      await this.model.findOneAndUpdate(
        { externalId: orderId, provider: 'PAYPAL' },
        { $set: { status: 'REFUNDED', raw: body } },
        { new: true },
      )
      return { ok: true }
    }

    return { ok: true }
  }
}
