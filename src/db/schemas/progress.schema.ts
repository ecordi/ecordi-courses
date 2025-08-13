import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export type ProgressDocument = Progress & Document

@Schema({ timestamps: true })
export class Progress {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
  courseId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'Unit', required: true })
  unitId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'Material', required: true })
  materialId: Types.ObjectId

  @Prop({ default: false })
  completed: boolean

  @Prop()
  completedAt: Date

  @Prop({ default: 0 })
  progressPercentage: number
  
  @Prop({ default: 0 })
  lastPosition: number // Para videos o PDFs, guardar la última posición
}

export const ProgressSchema = SchemaFactory.createForClass(Progress)
