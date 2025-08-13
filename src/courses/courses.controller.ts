import { Controller, Get, Param, UseGuards, Query } from '@nestjs/common'
import { CoursesService } from './courses.service'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { EnrollmentGuard } from './guards/enrollment.guard'
import { PaginationDto } from '../common/dto/pagination.dto'
import { ObjectIdPipe } from '../common/pipes/objectid.pipe'
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'

@ApiTags('Courses')
@Controller('courses')
export class CoursesController {
  constructor(private readonly service: CoursesService) {}

  @Get()
  @ApiOperation({ summary: 'List courses' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status' })
  async list(@Query() q: PaginationDto, @Query('status') status?: string) {
    return this.service.list(q, status)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get course detail' })
  async detail(@Param('id', ObjectIdPipe) id: string) {
    return this.service.detail(id)
  }

  @Get(':courseId/units')
  @UseGuards(JwtAuthGuard, EnrollmentGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List units for an enrolled user' })
  async units(@Param('courseId', ObjectIdPipe) courseId: string) {
    return this.service.units(courseId)
  }

  @Get(':courseId/materials/:materialId/url')
  @UseGuards(JwtAuthGuard, EnrollmentGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get signed URL for material (enrolled only)' })
  async signedUrl(@Param('courseId', ObjectIdPipe) courseId: string, @Param('materialId', ObjectIdPipe) materialId: string) {
    return this.service.materialSignedUrl(courseId, materialId)
  }
}