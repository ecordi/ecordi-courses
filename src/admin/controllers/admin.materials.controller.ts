import { Controller, UseGuards, Post, Patch, Delete, Get, Param, Body, UseInterceptors, UploadedFile } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
// Tipos definidos localmente para evitar dependencias externas
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'
import { AdminService } from '../services/admin.service'
import { CreateMaterialDto, UpdateMaterialDto } from '../dto/material.dto'
import { ObjectIdPipe } from '../../common/pipes/objectid.pipe'
import { ApiBearerAuth, ApiOperation, ApiTags, ApiBody, ApiConsumes } from '@nestjs/swagger'
import { CloudinaryService } from '../../cloudinary/cloudinary.service'

@ApiTags('Admin/Materials')
@ApiBearerAuth()
@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminMaterialsController {
  constructor(
    private readonly service: AdminService,
    private readonly cloudinaryService: CloudinaryService
  ) {}

  @Post('admin/units/:unitId/materials')
  @ApiOperation({ summary: 'Create material in unit' })
  async create(@Param('unitId', ObjectIdPipe) unitId: string, @Body() dto: CreateMaterialDto) {
    return this.service.addMaterial(unitId, dto)
  }
  
  @Post('admin/units/:unitId/materials/cloudinary')
  @ApiOperation({ summary: 'Create material in unit with Cloudinary file upload' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Archivo a subir'
        },
        type: {
          type: 'string',
          enum: ['PDF', 'IMG', 'VIDEO'],
          description: 'Tipo de material'
        },
        publicId: {
          type: 'string',
          description: 'ID público personalizado (opcional)'
        }
      }
    }
  })
  async createWithCloudinary(
    @Param('unitId', ObjectIdPipe) unitId: string,
    @UploadedFile() file: { buffer: Buffer; originalname: string; mimetype: string; size: number },
    @Body() body: { type: 'PDF' | 'IMG' | 'VIDEO'; publicId?: string }
  ) {
    if (!file) {
      throw new Error('No se ha proporcionado ningún archivo')
    }

    // Determinar el tipo de recurso para Cloudinary
    const resourceType = this.getResourceType(body.type)
    
    // Subir el archivo directamente a Cloudinary
    const result = await this.cloudinaryService.uploadFile(file.buffer, {
      folder: `course-materials/${unitId}`,
      publicId: body.publicId,
      resourceType
    })
    
    // Crear el material con los datos del archivo subido
    const materialDto: CreateMaterialDto = {
      type: body.type,
      // Guardamos el public_id completo de Cloudinary
      storageKey: result.public_id,
      // Guardamos la URL externa generada por Cloudinary
      externalUrl: result.secure_url,
      // Tamaño del archivo
      sizeBytes: file.size,
      // No tenemos checksum, pero podríamos calcularlo si fuera necesario
    }
    
    // Crear el material en la base de datos
    const material = await this.service.addMaterial(unitId, materialDto)
    
    return {
      material,
      cloudinary: {
        publicId: result.public_id,
        url: result.secure_url,
        format: result.format,
        resourceType: result.resource_type
      }
    }
  }
  @Get('admin/courses/:id/materials')
  @ApiOperation({ summary: 'Get all materials by course ID' })
  async getMaterialByCourse(@Param('id', ObjectIdPipe) id: string) {
    return this.service.getMaterialByCourse(id)
  }
  
  @Get('admin/materials/:id/cloudinary')
  @ApiOperation({ summary: 'Get material with Cloudinary URL' })
  async getMaterialWithCloudinaryUrl(@Param('id', ObjectIdPipe) id: string) {
    // Obtenemos el material
    const material = await this.service.getMaterial(id)
    
    // Si el material tiene una clave de almacenamiento (storageKey) y es de Cloudinary
    if (material.storageKey) {
      // Obtenemos la URL de Cloudinary basada en el tipo de material
      const cloudinaryUrl = this.cloudinaryService.getMaterialUrl(
        material.storageKey, 
        material.type
      )
      
      // Devolvemos el material con la URL de Cloudinary
      return {
        ...material,
        cloudinaryUrl: cloudinaryUrl.url
      }
    }
    
    // Si no tiene storageKey, simplemente devolvemos el material
    return material
  }
  
  // Método auxiliar para determinar el tipo de recurso en Cloudinary
  private getResourceType(materialType: 'PDF' | 'IMG' | 'VIDEO'): 'image' | 'video' | 'raw' {
    switch (materialType) {
      case 'IMG': return 'image'
      case 'VIDEO': return 'video'
      case 'PDF': 
      default: return 'raw'
    }
  }

  @Patch('admin/materials/:id')
  @ApiOperation({ summary: 'Update material' })
  async update(@Param('id', ObjectIdPipe) id: string, @Body() dto: UpdateMaterialDto) {
    return this.service.updateMaterial(id, dto)
  }

  @Delete('admin/materials/:id')
  @ApiOperation({ summary: 'Delete material' })
  async remove(@Param('id', ObjectIdPipe) id: string) {
    return this.service.deleteMaterial(id)
  }
}