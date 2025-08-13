import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { EnrollmentGuard } from '../courses/guards/enrollment.guard'
import { ProgressService } from './progress.service'
import { ApiBearerAuth, ApiOperation, ApiTags, ApiBody } from '@nestjs/swagger'
import { ObjectIdPipe } from '../common/pipes/objectid.pipe'

@ApiTags('Progress')
@ApiBearerAuth()
@Controller('progress')
@UseGuards(JwtAuthGuard)
export class ProgressController {
  constructor(private readonly service: ProgressService) {}

  @Post('courses/:courseId/units/:unitId/materials/:materialId')
  @UseGuards(EnrollmentGuard)
  @ApiOperation({ summary: 'Update progress for a material' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        completed: {
          type: 'boolean',
          description: 'Whether the material is completed'
        },
        progressPercentage: {
          type: 'number',
          description: 'Progress percentage (0-100)'
        },
        lastPosition: {
          type: 'number',
          description: 'Last position in video or document'
        }
      }
    }
  })
  async updateProgress(
    @Req() req: any,
    @Param('courseId', ObjectIdPipe) courseId: string,
    @Param('unitId', ObjectIdPipe) unitId: string,
    @Param('materialId', ObjectIdPipe) materialId: string,
    @Body() body: { completed?: boolean; progressPercentage?: number; lastPosition?: number }
  ) {
    const userId = req.user.userId
    return this.service.updateProgress(userId, courseId, unitId, materialId, body)
  }

  @Get('courses/:courseId')
  @UseGuards(EnrollmentGuard)
  @ApiOperation({ summary: 'Get progress for a course' })
  async getProgress(
    @Req() req: any,
    @Param('courseId', ObjectIdPipe) courseId: string
  ) {
    const userId = req.user.userId
    return this.service.getProgress(userId, courseId)
  }

  @Get('materials/:materialId')
  @UseGuards(EnrollmentGuard)
  @ApiOperation({ summary: 'Get progress for a specific material' })
  async getMaterialProgress(
    @Req() req: any,
    @Param('materialId', ObjectIdPipe) materialId: string
  ) {
    const userId = req.user.userId
    return this.service.getMaterialProgress(userId, materialId)
  }
}
