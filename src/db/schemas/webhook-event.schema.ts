import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
export type WebhookEventDocument = HydratedDocument<WebhookEvent>

@Schema({ timestamps: true })
export class WebhookEvent {
  @Prop({ type: String, required: true, unique: true, index: true })
  eventId: string

  @Prop({ type: String, required: true })
  provider: 'MP' | 'PAYPAL'

  @Prop({ type: Object })
  payload: Record<string, any>
}
export const WebhookEventSchema = SchemaFactory.createForClass(WebhookEvent)