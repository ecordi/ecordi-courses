import { Controller, UseGuards, Post, Get, Patch, Delete, Param, Body, Query } from '@nestjs/common'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'
import { AdminService } from '../services/admin.service'
import { CreateCourseDto, UpdateCourseDto } from '../dto/course.dto'
import { PaginationDto } from '../../common/dto/pagination.dto'
import { ObjectIdPipe } from '../../common/pipes/objectid.pipe'
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'

@ApiTags('Admin/Courses')
@ApiBearerAuth()
@Controller('admin/courses')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminCoursesController {
  constructor(private readonly service: AdminService) {}

  @Post()
  @ApiOperation({ summary: 'Create course' })
  async create(@Body() dto: CreateCourseDto) { return this.service.createCourse(dto) }

  @Get()
  @ApiOperation({ summary: 'List courses (admin)' })
  @ApiQuery({ name: 'status', required: false })
  async list(@Query() q: PaginationDto, @Query('status') status?: string) {
    return this.service.listCoursesPaged(q, status)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get course by id (admin)' })
  async get(@Param('id', ObjectIdPipe) id: string) { return this.service.getCourse(id) }

  @Patch(':id')
  @ApiOperation({ summary: 'Update course' })
  async update(@Param('id', ObjectIdPipe) id: string, @Body() dto: UpdateCourseDto) { return this.service.updateCourse(id, dto) }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete course' })
  async remove(@Param('id', ObjectIdPipe) id: string) { return this.service.deleteCourse(id) }
}