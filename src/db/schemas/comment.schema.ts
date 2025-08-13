import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export type CommentDocument = Comment & Document

@Schema({ timestamps: true })
export class Comment {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'Material', required: true })
  materialId: Types.ObjectId

  @Prop({ required: true })
  content: string

  @Prop({ type: Types.ObjectId, ref: 'Comment' })
  parentId: Types.ObjectId // Para respuestas a comentarios

  @Prop({ default: 0 })
  likes: number

  @Prop({ default: [] })
  likedBy: Types.ObjectId[]

  @Prop({ default: false })
  isInstructor: boolean // Para identificar comentarios del instructor
}

export const CommentSchema = SchemaFactory.createForClass(Comment)
