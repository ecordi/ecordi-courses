import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose'
import { HydratedDocument, Types } from 'mongoose'
export type UnitDocument = HydratedDocument<Unit>

@Schema({ timestamps: true })
export class Unit {
  @Prop({ type: Types.ObjectId, ref: 'Course', required: true, index: true }) courseId: Types.ObjectId
  @Prop({ type: String, required: true }) title: string
  @Prop({ type: Number, default: 0 }) order: number
}
export const UnitSchema = SchemaFactory.createForClass(Unit)