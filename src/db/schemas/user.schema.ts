import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
import * as bcrypt from 'bcrypt'
export type UserDocument = HydratedDocument<User>

@Schema({ timestamps: true })
export class User {
  @Prop({ type: String, required: true }) name: string
  @Prop({ type: String, required: true, unique: true, lowercase: true, index: true }) email: string
  @Prop({ type: String, select: false }) passwordHash: string
  @Prop({ type: String, enum: ['STUDENT', 'ADMIN'], default: 'STUDENT', index: true }) role: 'STUDENT' | 'ADMIN'
  @Prop({ type: Object }) oauth: { googleId?: string; facebookId?: string }
}
export const UserSchema = SchemaFactory.createForClass(User)
UserSchema.methods.setPassword = async function (raw: string) {
  const salt = await bcrypt.genSalt(10)
  this.passwordHash = await bcrypt.hash(raw, salt)
}
UserSchema.methods.validatePassword = async function (raw: string) {
  console.log('validatePassword called, passwordHash exists:', !!this.passwordHash)
  if (!this.passwordHash) {
    console.log('No passwordHash found for user')
    return false
  }
  try {
    const result = await bcrypt.compare(raw, this.passwordHash)
    console.log('bcrypt.compare result:', result)
    return result
  } catch (error) {
    console.error('Error in validatePassword:', error)
    return false
  }
}