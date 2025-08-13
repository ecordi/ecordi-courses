import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { Course, CourseDocument } from '../db/schemas/course.schema'
import { Unit, UnitDocument } from '../db/schemas/unit.schema'
import { Material, MaterialDocument } from '../db/schemas/material.schema'
import { StorageService } from '../storage/storage.service'
import { PaginationDto } from '../common/dto/pagination.dto'
import { CourseFilterDto } from './dto/course.dto'

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    @InjectModel(Unit.name) private unitModel: Model<UnitDocument>,
    @InjectModel(Material.name) private materialModel: Model<MaterialDocument>,
    private storage: StorageService
  ) {}

  async list(q: PaginationDto, filters?: CourseFilterDto) {
    const filter: any = {}
    
    // Aplicar filtros si existen
    if (filters) {
      if (filters.active !== undefined) filter.status = filters.active ? 'ACTIVE' : 'INACTIVE'
      if (filters.search) {
        filter.$or = [
          { title: { $regex: filters.search, $options: 'i' } },
          { description: { $regex: filters.search, $options: 'i' } }
        ]
      }
      if (filters.category) filter.category = filters.category
    }
    
    const skip = (q.page - 1) * q.pageSize
    const [items, total] = await Promise.all([
      this.courseModel.find(filter).skip(skip).limit(q.pageSize).sort({ createdAt: -1 }).lean(),
      this.courseModel.countDocuments(filter)
    ])
    return { items, total, page: q.page, pageSize: q.pageSize }
  }

  async detail(id: string) {
    const item = await this.courseModel.findById(id).lean()
    if (!item) throw new NotFoundException('Curso no encontrado')
    return item
  }

  async units(courseId: string) {
    return this.unitModel.find({ courseId: new Types.ObjectId(courseId) }).sort({ order: 1 }).lean()
  }

  async materialSignedUrl(courseId: string, materialId: string) {
    const mat = await this.materialModel.findById(materialId).lean()
    if (!mat || !mat.storageKey) throw new NotFoundException('Material no encontrado')
    const url = await this.storage.getSignedReadUrl(mat.storageKey, 300)
    return { url, expiresIn: 300 }
  }
}