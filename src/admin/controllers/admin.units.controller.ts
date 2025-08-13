import { Controller, UseGuards, Post, Patch, Delete, Param, Body } from '@nestjs/common'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'
import { AdminService } from '../services/admin.service'
import { CreateUnitDto, UpdateUnitDto } from '../dto/unit.dto'
import { ObjectIdPipe } from '../../common/pipes/objectid.pipe'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'

@ApiTags('Admin/Units')
@ApiBearerAuth()
@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminUnitsController {
  constructor(private readonly service: AdminService) {}

  @Post('admin/courses/:courseId/units')
  @ApiOperation({ summary: 'Create unit in course' })
  async create(@Param('courseId', ObjectIdPipe) courseId: string, @Body() dto: CreateUnitDto) {
    return this.service.createUnit(courseId, dto)
  }

  @Patch('admin/units/:id')
  @ApiOperation({ summary: 'Update unit' })
  async update(@Param('id', ObjectIdPipe) id: string, @Body() dto: UpdateUnitDto) {
    return this.service.updateUnit(id, dto)
  }

  @Delete('admin/units/:id')
  @ApiOperation({ summary: 'Delete unit' })
  async remove(@Param('id', ObjectIdPipe) id: string) {
    return this.service.deleteUnit(id)
  }
}