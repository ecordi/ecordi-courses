import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger'
import { CategoriesService } from '../categories/categories.service'
import { CreateCategoryDto } from '../categories/dto/category.dto'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { RolesGuard } from '../common/guards/roles.guard'
import { Roles } from '../common/decorators/roles.decorator'

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly service: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todas las categorías disponibles' })
  async list() {
    return this.service.list()
  }

  @Get('stats')
  @ApiOperation({ summary: 'Obtener estadísticas de cursos por categoría' })
  async getStats() {
    return this.service.getStats()
  }
  
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear una nueva categoría personalizada' })
  async create(@Body() dto: CreateCategoryDto) {
    return this.service.create(dto)
  }
  
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'ID de la categoría' })
  @ApiOperation({ summary: 'Actualizar una categoría personalizada existente' })
  async update(@Param('id') id: string, @Body() dto: CreateCategoryDto) {
    return this.service.update(id, dto)
  }
  
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'ID de la categoría' })
  @ApiOperation({ summary: 'Eliminar una categoría personalizada' })
  async delete(@Param('id') id: string) {
    return this.service.delete(id)
  }
}
