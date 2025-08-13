import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose'
import { HydratedDocument, Types } from 'mongoose'
export type PaymentDocument = HydratedDocument<Payment>

@Schema({ timestamps: true })
export class Payment {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true }) userId: Types.ObjectId
  @Prop({ type: Types.ObjectId, ref: 'Course', required: true, index: true }) courseId: Types.ObjectId
  @Prop({ type: String, enum: ['MP', 'PAYPAL'], required: true, index: true }) provider: 'MP' | 'PAYPAL'
  @Prop({ type: String, required: true }) externalId: string
  @Prop({ type: String, enum: ['CREATED', 'APPROVED', 'REJECTED', 'REFUNDED'], default: 'CREATED', index: true }) status: 'CREATED' | 'APPROVED' | 'REJECTED' | 'REFUNDED'
  @Prop({ type: Number, required: true }) amount: number
  @Prop({ type: Object }) raw: Record<string, any>
}
export const PaymentSchema = SchemaFactory.createForClass(Payment)