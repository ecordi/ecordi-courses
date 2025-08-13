import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { Enrollment, EnrollmentDocument } from '../db/schemas/enrollment.schema'

@Injectable()
export class EnrollmentsService {
  constructor(@InjectModel(Enrollment.name) private model: Model<EnrollmentDocument>) {}

  async activate(userId: string, courseId: string) {
    const up = await this.model.findOneAndUpdate(
      { userId: new Types.ObjectId(userId), courseId: new Types.ObjectId(courseId) },
      { $set: { status: 'ACTIVE', activatedAt: new Date() } },
      { upsert: true, new: true }
    )
    return up
  }

  async my(userId: string) {
    return this.model.find({ userId: new Types.ObjectId(userId) }).lean()
  }
}