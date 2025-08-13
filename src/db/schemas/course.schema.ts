import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
export type CourseDocument = HydratedDocument<Course>

@Schema({ timestamps: true })
export class Course {
  @Prop({ type: String, required: true }) title: string
  @Prop({ type: String, required: true }) description: string
  @Prop({ type: Number, required: true, min: 0 }) priceUsd: number
  @Prop({ type: String }) coverUrl: string
  @Prop({ type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE', index: true }) status: 'ACTIVE' | 'INACTIVE'
}
export const CourseSchema = SchemaFactory.createForClass(Course)