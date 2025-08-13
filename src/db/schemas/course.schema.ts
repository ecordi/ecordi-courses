import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

// Enum para categorías de cursos
export enum CourseCategory {
  PROGRAMMING = 'PROGRAMMING',
  DESIGN = 'DESIGN',
  BUSINESS = 'BUSINESS',
  MARKETING = 'MARKETING',
  HEALTH = 'HEALTH',
  MUSIC = 'MUSIC',
  PHOTOGRAPHY = 'PHOTOGRAPHY',
  PERSONAL_DEVELOPMENT = 'PERSONAL_DEVELOPMENT',
  OTHER = 'OTHER'
}
export type CourseDocument = HydratedDocument<Course>

@Schema({ timestamps: true })
export class Course {
  @Prop({ type: String, required: true }) title: string
  @Prop({ type: String, required: true }) description: string
  @Prop({ type: Number, required: true, min: 0 }) priceUsd: number
  @Prop({ type: String }) coverUrl: string
  @Prop({ type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE', index: true }) status: 'ACTIVE' | 'INACTIVE'
  @Prop({ type: String, enum: Object.values(CourseCategory), default: CourseCategory.OTHER, index: true }) category: CourseCategory
}
export const CourseSchema = SchemaFactory.createForClass(Course)