import { Controller, UseGuards, Post, Patch, Delete, Param, Body } from '@nestjs/common'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'
import { AdminService } from '../services/admin.service'
import { CreateMaterialDto, UpdateMaterialDto } from '../dto/material.dto'
import { ObjectIdPipe } from '../../common/pipes/objectid.pipe'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'

@ApiTags('Admin/Materials')
@ApiBearerAuth()
@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminMaterialsController {
  constructor(private readonly service: AdminService) {}

  @Post('admin/units/:unitId/materials')
  @ApiOperation({ summary: 'Create material in unit' })
  async create(@Param('unitId', ObjectIdPipe) unitId: string, @Body() dto: CreateMaterialDto) {
    return this.service.addMaterial(unitId, dto)
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