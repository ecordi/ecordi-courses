import MercadoPagoConfig, { Preference, Payment, MerchantOrder } from 'mercadopago'
import * as crypto from 'crypto'


export class MpProvider {
  private pref: Preference
  private payment: Payment
  private order: MerchantOrder

  constructor() {
    const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN as string })
    this.pref = new Preference(client)
    this.payment = new Payment(client)
    this.order = new MerchantOrder(client)
  }

  async createPreference(params: { title: string; amount: number; external_reference: string; metadata: any }) {
    const base = (process.env.BACKEND_PUBLIC_URL || 'http://localhost:3000').replace(/\/$/, '')
    const successUrl = process.env.MP_BACK_URL_SUCCESS || `${base}/payments/success`
    const failureUrl = process.env.MP_BACK_URL_FAILURE || `${base}/payments/failure`
    const pendingUrl = process.env.MP_BACK_URL_PENDING || `${base}/payments/pending`
    const notificationUrl = process.env.MP_NOTIFICATION_URL || `${base}/payments/mp/webhook`
    const currency = (process.env.MP_CURRENCY_ID || 'USD').toUpperCase()

    const res = await this.pref.create({
      body: {
        items: [{ id: params.external_reference, title: params.title, quantity: 1, currency_id: currency as any, unit_price: Number(params.amount.toFixed(2)) }],
        external_reference: params.external_reference,
        back_urls: { success: successUrl, failure: failureUrl, pending: pendingUrl },
        auto_return: 'approved',
        notification_url: notificationUrl,
        metadata: params.metadata,
      },
    })

    return { id: (res as any).id, init_point: (res as any).init_point }
  }

  async getPayment(id: string): Promise<any> {
    const res = await this.payment.get({ id: id as any } as any)
    return res as any
  }

  async getMerchantOrder(id: string): Promise<{ external_reference?: string; total_amount?: number; paid_amount?: number }> {
    const res = await (this.order as any).get({ merchantOrderId: id as any } as any)
    return {
      external_reference: (res as any).external_reference,
      total_amount: Number((res as any).total_amount ?? 0),
      paid_amount: Number((res as any).paid_amount ?? 0),
    }
  }

  // x-signature: "ts=...,v1=..."
  // manifest: "id:{dataId};request-id:{x-request-id};ts:{ts};"
  verifyWebhookSignature(signature?: string, requestId?: string, dataId?: string) {
    try {
      if (!signature || !requestId || !dataId) return false

      const parts = signature.split(',').map(s => s.trim())
      const ts = (parts.find(p => p.startsWith('ts=')) || '').slice(3)
      const v1 = (parts.find(p => p.startsWith('v1=')) || '').slice(3)
      if (!ts || !v1) return false
      if (!/^[0-9a-f]{64}$/i.test(v1)) return false

      if (process.env.MP_LOG_WEBHOOK === '1') {
        const sec = process.env.MP_WEBHOOK_SHARED_SECRET || process.env.MP_WEBHOOK_SECRET || ''
        console.log('[MP] secret length =', sec.length)
        console.log('[MP] secret tail =', sec.slice(-8))
        console.log('[MP] manifest dataId =', dataId)
        console.log('[MP] manifest requestId =', requestId)
        console.log('[MP] manifest ts =', ts)
      }

      // Probar con ambos formatos de manifest
      const manifests = [
        // Formato estándar
        `id:${dataId};request-id:${requestId};ts:${ts};`,
        // Formato alternativo para webhooks de payment
        `data.id:${dataId};request-id:${requestId};ts:${ts};`
      ]
      
      const secrets = [
        process.env.MP_WEBHOOK_SHARED_SECRET || process.env.MP_WEBHOOK_SECRET || '',
        process.env.MP_WEBHOOK_SHARED_SECRET_OLD || '',
      ].filter(Boolean)

      for (const secret of secrets) {
        for (const manifest of manifests) {
          if (process.env.MP_LOG_WEBHOOK === '1') {
            console.log('[MP] trying manifest:', manifest)
          }
          
          const calc = crypto.createHmac('sha256', secret).update(manifest).digest('hex')
          const a = Buffer.from(calc, 'hex')
          const b = Buffer.from(v1, 'hex')
          if (a.length === b.length && crypto.timingSafeEqual(a, b)) return true
        }
      }

      return false
    } catch (error) {
      if (process.env.MP_LOG_WEBHOOK === '1') {
        console.error('[MP] signature verification error:', error)
      }
      return false
    }
  }
}
