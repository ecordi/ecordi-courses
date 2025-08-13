import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Course, CourseDocument, CourseCategory } from '../db/schemas/course.schema'
import { Category, CategoryDocument } from '../db/schemas/category.schema'
import { CreateCategoryDto } from './dto/category.dto'

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>
  ) {}

  async list() {
    // Obtener categorías del enum
    const systemCategories = Object.values(CourseCategory).map(category => {
      return {
        id: category,
        name: this.getCategoryName(category),
        description: this.getCategoryDescription(category),
        type: 'system'
      }
    })
    
    // Obtener categorías personalizadas de la base de datos
    const customCategories = await this.categoryModel.find({ active: true }).lean()
    const mappedCustomCategories = customCategories.map(cat => ({
      id: cat.id,
      name: cat.name,
      description: cat.description,
      type: 'custom'
    }))
    
    // Combinar ambas listas
    const allCategories = [...systemCategories, ...mappedCustomCategories]
    
    return { categories: allCategories }
  }

  async getStats() {
    // Obtiene estadísticas de cursos por categoría
    const stats = await this.courseModel.aggregate([
      { $match: { status: 'ACTIVE' } },
      { $group: { 
        _id: '$category', 
        count: { $sum: 1 },
        avgPrice: { $avg: '$price' }
      }},
      { $project: {
        category: '$_id',
        count: 1,
        avgPrice: { $round: ['$avgPrice', 2] },
        _id: 0
      }}
    ])

    // Añadir nombres de categorías a los resultados
    const statsWithNames = stats.map(stat => ({
      ...stat,
      name: this.getCategoryName(stat.category)
    }))
    
    return { stats: statsWithNames }
  }

  async create(dto: CreateCategoryDto) {
    // Verificar si ya existe una categoría con el mismo ID
    const exists = await this.categoryModel.findOne({ id: dto.id }).exec()
    if (exists) {
      throw new BadRequestException(`Ya existe una categoría con el ID ${dto.id}`)
    }

    // Crear la nueva categoría
    const newCategory = new this.categoryModel(dto)
    await newCategory.save()

    return {
      success: true,
      category: {
        id: newCategory.id,
        name: newCategory.name,
        description: newCategory.description,
        type: 'custom'
      }
    }
  }

  async update(id: string, dto: Partial<CreateCategoryDto>) {
    // Verificar si existe la categoría
    const category = await this.categoryModel.findOne({ id }).exec()
    if (!category) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`)
    }

    // Actualizar la categoría
    await this.categoryModel.updateOne({ id }, { $set: dto })
    const updated = await this.categoryModel.findOne({ id }).exec()

    return {
      success: true,
      category: {
        id: updated.id,
        name: updated.name,
        description: updated.description,
        type: 'custom'
      }
    }
  }

  async delete(id: string) {
    // Verificar si existe la categoría
    const category = await this.categoryModel.findOne({ id }).exec()
    if (!category) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`)
    }

    // Eliminar la categoría (soft delete)
    await this.categoryModel.updateOne({ id }, { $set: { active: false } })

    return {
      success: true,
      message: `Categoría ${category.name} eliminada correctamente`
    }
  }

  private getCategoryName(category: CourseCategory): string {
    const names = {
      [CourseCategory.PROGRAMMING]: 'Programación',
      [CourseCategory.DESIGN]: 'Diseño',
      [CourseCategory.BUSINESS]: 'Negocios',
      [CourseCategory.MARKETING]: 'Marketing',
      [CourseCategory.HEALTH]: 'Salud y Bienestar',
      [CourseCategory.MUSIC]: 'Música',
      [CourseCategory.PHOTOGRAPHY]: 'Fotografía',
      [CourseCategory.PERSONAL_DEVELOPMENT]: 'Desarrollo Personal',
      [CourseCategory.OTHER]: 'Otros'
    }
    
    return names[category] || 'Desconocida'
  }

  private getCategoryDescription(category: CourseCategory): string {
    const descriptions = {
      [CourseCategory.PROGRAMMING]: 'Cursos de programación, desarrollo web, móvil y software',
      [CourseCategory.DESIGN]: 'Cursos de diseño gráfico, UX/UI, y diseño de productos',
      [CourseCategory.BUSINESS]: 'Cursos de emprendimiento, gestión y finanzas',
      [CourseCategory.MARKETING]: 'Cursos de marketing digital, redes sociales y publicidad',
      [CourseCategory.HEALTH]: 'Cursos de salud, nutrición, fitness y bienestar',
      [CourseCategory.MUSIC]: 'Cursos de instrumentos musicales, producción y teoría musical',
      [CourseCategory.PHOTOGRAPHY]: 'Cursos de fotografía, edición y videografía',
      [CourseCategory.PERSONAL_DEVELOPMENT]: 'Cursos de desarrollo personal, productividad y liderazgo',
      [CourseCategory.OTHER]: 'Otros cursos especializados'
    }
    
    return descriptions[category] || 'Sin descripción disponible'
  }
}
