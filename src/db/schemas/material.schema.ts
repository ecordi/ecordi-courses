import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose'
import { HydratedDocument, Types } from 'mongoose'
export type MaterialDocument = HydratedDocument<Material>

@Schema({ timestamps: true })
export class Material {
  @Prop({ type: Types.ObjectId, ref: 'Unit', required: true, index: true }) unitId: Types.ObjectId
  @Prop({ type: String, enum: ['PDF', 'IMG', 'VIDEO'], required: true }) type: 'PDF' | 'IMG' | 'VIDEO'
  @Prop({ type: String }) storageKey: string
  @Prop({ type: String }) externalUrl: string
  @Prop({ type: Number }) sizeBytes: number
  @Prop({ type: String }) checksum: string
}
export const MaterialSchema = SchemaFactory.createForClass(Material)