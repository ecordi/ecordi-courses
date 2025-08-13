import { Controller, Get, Param, UseGuards, Query } from '@nestjs/common'
import { CoursesService } from './courses.service'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { EnrollmentGuard } from './guards/enrollment.guard'
import { PaginationDto } from '../common/dto/pagination.dto'
import { ObjectIdPipe } from '../common/pipes/objectid.pipe'
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'
import { CourseFilterDto } from './dto/course.dto'
import { CourseCategory } from '../db/schemas/course.schema'

@ApiTags('Courses')
@Controller('courses')
export class CoursesController {
  constructor(private readonly service: CoursesService) {}

  @Get()
  @ApiOperation({ summary: 'List courses' })
  @ApiQuery({ name: 'search', required: false, description: 'Search in title and description' })
  @ApiQuery({ name: 'active', required: false, description: 'Filter by active status', type: Boolean })
  @ApiQuery({ name: 'category', required: false, description: 'Filter by category', enum: CourseCategory })
  async list(
    @Query() q: PaginationDto, 
    @Query('search') search?: string,
    @Query('active') active?: boolean,
    @Query('category') category?: CourseCategory
  ) {
    const filters: CourseFilterDto = {};
    if (search) filters.search = search;
    if (active !== undefined) filters.active = typeof active === 'string' ? active === 'true' : active;
    if (category) filters.category = category as CourseCategory;
    
    return this.service.list(q, filters);
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