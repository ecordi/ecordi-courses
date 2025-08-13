import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose'
import { HydratedDocument, Types } from 'mongoose'
export type EnrollmentDocument = HydratedDocument<Enrollment>

@Schema({ timestamps: true })
export class Enrollment {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true }) userId: Types.ObjectId
  @Prop({ type: Types.ObjectId, ref: 'Course', required: true, index: true }) courseId: Types.ObjectId
  @Prop({ type: String, enum: ['PENDING', 'ACTIVE', 'EXPIRED', 'CANCELED'], default: 'PENDING', index: true }) status: 'PENDING' | 'ACTIVE' | 'EXPIRED' | 'CANCELED'
  @Prop({ type: Date }) activatedAt: Date
  @Prop({ type: Date }) expiresAt: Date
}
export const EnrollmentSchema = SchemaFactory.createForClass(Enrollment)
EnrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true })