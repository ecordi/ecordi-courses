import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { Course, CourseDocument } from '../../db/schemas/course.schema'
import { Unit, UnitDocument } from '../../db/schemas/unit.schema'
import { Material, MaterialDocument } from '../../db/schemas/material.schema'
import { CreateCourseDto, UpdateCourseDto } from '../dto/course.dto'
import { CreateUnitDto, UpdateUnitDto } from '../dto/unit.dto'
import { CreateMaterialDto, UpdateMaterialDto } from '../dto/material.dto'
import { PaginationDto } from '../../common/dto/pagination.dto'

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    @InjectModel(Unit.name) private unitModel: Model<UnitDocument>,
    @InjectModel(Material.name) private materialModel: Model<MaterialDocument>
  ) {}

  async createCourse(dto: CreateCourseDto) {
    const c = new this.courseModel({ ...dto, status: 'ACTIVE' })
    return c.save()
  }

  async listCoursesPaged(q: PaginationDto, status?: string) {
    const filter: any = {}
    if (status) filter.status = status
    const skip = (q.page - 1) * q.pageSize
    const [items, total] = await Promise.all([
      this.courseModel.find(filter).skip(skip).limit(q.pageSize).sort({ createdAt: -1 }).lean(),
      this.courseModel.countDocuments(filter)
    ])
    return { items, total, page: q.page, pageSize: q.pageSize }
  }

  async getCourse(id: string) {
    const c = await this.courseModel.findById(id).lean()
    if (!c) throw new NotFoundException('Curso no encontrado')
    return c
  }

  async updateCourse(id: string, dto: UpdateCourseDto) {
    const c = await this.courseModel.findByIdAndUpdate(id, { $set: dto }, { new: true })
    if (!c) throw new NotFoundException('Curso no encontrado')
    return c
  }

  async deleteCourse(id: string) {
    const units = await this.unitModel.find({ courseId: new Types.ObjectId(id) }, { _id: 1 })
    await this.materialModel.deleteMany({ unitId: { $in: units.map(u => u._id) } })
    await this.unitModel.deleteMany({ courseId: new Types.ObjectId(id) })
    await this.courseModel.findByIdAndDelete(id)
    return { ok: true }
  }

  async createUnit(courseId: string, dto: CreateUnitDto) {
    const exists = await this.courseModel.exists({ _id: new Types.ObjectId(courseId) })
    if (!exists) throw new NotFoundException('Curso no encontrado')
    const u = new this.unitModel({ ...dto, courseId: new Types.ObjectId(courseId) })
    return u.save()
  }

  async updateUnit(id: string, dto: UpdateUnitDto) {
    const u = await this.unitModel.findByIdAndUpdate(id, { $set: dto }, { new: true })
    if (!u) throw new NotFoundException('Unidad no encontrada')
    return u
  }

  async deleteUnit(id: string) {
    await this.materialModel.deleteMany({ unitId: new Types.ObjectId(id) })
    await this.unitModel.findByIdAndDelete(id)
    return { ok: true }
  }

  async addMaterial(unitId: string, dto: CreateMaterialDto) {
    const exists = await this.unitModel.exists({ _id: new Types.ObjectId(unitId) })
    if (!exists) throw new NotFoundException('Unidad no encontrada')
    const m = new this.materialModel({ ...dto, unitId: new Types.ObjectId(unitId) })
    return m.save()
  }

  async updateMaterial(id: string, dto: UpdateMaterialDto) {
    const m = await this.materialModel.findByIdAndUpdate(id, { $set: dto }, { new: true })
    if (!m) throw new NotFoundException('Material no encontrado')
    return m
  }

  async deleteMaterial(id: string) {
    await this.materialModel.findByIdAndDelete(id)
    return { ok: true }
  }
}