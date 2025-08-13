// providers/paypal.provider.ts
import * as paypal from '@paypal/checkout-server-sdk'

type VerifyResult =
  | { ok: true; status: 'SUCCESS' }
  | { ok: false; status: 'SKIPPED'; reason: string }
  | { ok: false; status: 'FAILURE'; reason: string; ppStatus?: string; ppError?: any }

export class PayPalProvider {
  private env: paypal.core.SandboxEnvironment | paypal.core.LiveEnvironment
  private client: paypal.core.PayPalHttpClient
  private readonly isSandbox: boolean

  constructor() {
    this.isSandbox = (process.env.PAYPAL_ENV || 'sandbox') === 'sandbox'
    const clientId = process.env.PAYPAL_CLIENT_ID as string
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET as string
    if (!clientId || !clientSecret) {
      throw new Error('PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET are required')
    }
    this.env = this.isSandbox
      ? new paypal.core.SandboxEnvironment(clientId, clientSecret)
      : new paypal.core.LiveEnvironment(clientId, clientSecret)
    this.client = new paypal.core.PayPalHttpClient(this.env)
  }
  async createOrder(amountUsd: number, reference: string, courseId: string, userId: string) {
    const returnUrl = process.env.PP_RETURN_URL || 'https://example.com/pp/success'
    const cancelUrl = process.env.PP_CANCEL_URL || 'https://example.com/pp/cancel'

    const request = new paypal.orders.OrdersCreateRequest()
    request.headers['Prefer'] = 'return=representation'
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        reference_id: reference,
        amount: { currency_code: 'USD', value: amountUsd.toFixed(2) },
        custom_id: JSON.stringify({ courseId, userId })
      }],
      application_context: {
        brand_name: process.env.PP_BRAND_NAME || 'Courses Platform',
        user_action: 'PAY_NOW',
        return_url: returnUrl,
        cancel_url: cancelUrl
      }
    })
    const response = await this.client.execute(request)
    const approveUrl = (response.result as any).links?.find((l: any) => l.rel === 'approve')?.href
    return { id: (response.result as any).id, approveUrl }
  }
  async verifyWebhook(headers: Record<string, any>, body: any): Promise<VerifyResult> {
    // 1) Validaciones locales mínimas (para no verificar contra valores undefined)
    const webhookId = process.env.PAYPAL_WEBHOOK_ID || ''
    const authAlgo = headers['paypal-auth-algo']
    const certUrl = headers['paypal-cert-url']
    const transmissionId = headers['paypal-transmission-id']
    const transmissionSig = headers['paypal-transmission-sig']
    const transmissionTime = headers['paypal-transmission-time']

    if (!webhookId) {
      if (process.env.PP_LOG_WEBHOOK === '1') {
        console.warn('[PP] SKIPPED: PAYPAL_WEBHOOK_ID vacío/undefined')
      }
      return { ok: false, status: 'SKIPPED', reason: 'WEBHOOK_ID_MISSING' }
    }
    if (!authAlgo || !certUrl || !transmissionId || !transmissionSig || !transmissionTime) {
      if (process.env.PP_LOG_WEBHOOK === '1') {
        console.warn('[PP] SKIPPED: faltan headers de firma', {
          has_authAlgo: !!authAlgo,
          has_certUrl: !!certUrl,
          has_transmissionId: !!transmissionId,
          has_transmissionSig: !!transmissionSig,
          has_transmissionTime: !!transmissionTime,
        })
      }
      return { ok: false, status: 'SKIPPED', reason: 'MISSING_SIGNATURE_HEADERS' }
    }

    // 2) Chequeo de entorno vs cert_url (evita mezclar live/sandbox)
    const mustContain = this.isSandbox ? 'api.sandbox.paypal.com' : 'api.paypal.com'
    if (typeof certUrl !== 'string' || !certUrl.includes(mustContain)) {
      if (process.env.PP_LOG_WEBHOOK === '1') {
        console.warn('[PP] SKIPPED: cert_url no coincide con el entorno', { certUrl, mustContain })
      }
      return { ok: false, status: 'SKIPPED', reason: 'CERT_URL_ENV_MISMATCH' }
    }

    // 3) Llamado a verificación oficial
    try {
      const req = new paypal.core.PayPalHttpRequest('/v1/notifications/verify-webhook-signature', 'POST')
      req.headers['Content-Type'] = 'application/json'
      req.body = {
        auth_algo: authAlgo,
        cert_url: certUrl,
        transmission_id: transmissionId,
        transmission_sig: transmissionSig,
        transmission_time: transmissionTime,
        webhook_id: webhookId,
        webhook_event: body, // enviar el mismo JSON que recibiste
      }

      const res = await this.client.execute(req) as any
      const status: string | undefined = res?.result?.verification_status

      if (process.env.PP_LOG_WEBHOOK === '1') {
        const maskedSig = String(transmissionSig).slice(0, 8) + '...' + String(transmissionSig).slice(-8)
        console.log('[PP] verify status=', status, {
          webhookId_tail: webhookId.slice(-6),
          transmissionId,
          transmissionTime,
          authAlgo,
          sig_tail: maskedSig,
        })
      }

      if (status === 'SUCCESS') return { ok: true, status: 'SUCCESS' }
      return { ok: false, status: 'FAILURE', reason: 'PP_VERIFICATION_RETURNED_FAILURE', ppStatus: status }
    } catch (err: any) {
      if (process.env.PP_LOG_WEBHOOK === '1') {
        console.error('[PP] verify error:', err?.statusCode || err?.status || err?.message || err)
      }
      return { ok: false, status: 'FAILURE', reason: 'PP_VERIFY_REQUEST_ERROR', ppError: err?.message || err }
    }
  }
}
