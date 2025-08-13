import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { Progress, ProgressDocument } from '../db/schemas/progress.schema'

@Injectable()
export class ProgressService {
  constructor(
    @InjectModel(Progress.name) private model: Model<ProgressDocument>
  ) {}

  async updateProgress(
    userId: string,
    courseId: string,
    unitId: string,
    materialId: string,
    data: { completed?: boolean; progressPercentage?: number; lastPosition?: number }
  ) {
    const update: any = {}
    
    if (data.completed !== undefined) {
      update.completed = data.completed
      if (data.completed) {
        update.completedAt = new Date()
      }
    }
    
    if (data.progressPercentage !== undefined) {
      update.progressPercentage = data.progressPercentage
    }
    
    if (data.lastPosition !== undefined) {
      update.lastPosition = data.lastPosition
    }
    
    return this.model.findOneAndUpdate(
      {
        userId: new Types.ObjectId(userId),
        courseId: new Types.ObjectId(courseId),
        unitId: new Types.ObjectId(unitId),
        materialId: new Types.ObjectId(materialId)
      },
      { $set: update },
      { upsert: true, new: true }
    )
  }

  async getProgress(userId: string, courseId: string) {
    return this.model.find({
      userId: new Types.ObjectId(userId),
      courseId: new Types.ObjectId(courseId)
    }).lean()
  }

  async getMaterialProgress(userId: string, materialId: string) {
    return this.model.findOne({
      userId: new Types.ObjectId(userId),
      materialId: new Types.ObjectId(materialId)
    }).lean()
  }

  async calculateCourseProgress(userId: string, courseId: string, totalMaterials: number) {
    const completedMaterials = await this.model.countDocuments({
      userId: new Types.ObjectId(userId),
      courseId: new Types.ObjectId(courseId),
      completed: true
    })
    
    return {
      completedMaterials,
      totalMaterials,
      progressPercentage: totalMaterials > 0 ? Math.round((completedMaterials / totalMaterials) * 100) : 0
    }
  }
}
