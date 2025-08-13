import { Controller, UseGuards, Post, Param, Body } from '@nestjs/common'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'
import { ApiBearerAuth, ApiOperation, ApiTags, ApiBody } from '@nestjs/swagger'
import { EnrollmentsService } from '../../enrollments/enrollments.service'
import { ObjectIdPipe } from '../../common/pipes/objectid.pipe'

@ApiTags('Admin/Enrollments')
@ApiBearerAuth()
@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminEnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post('admin/enrollments/activate')
  @ApiOperation({ summary: 'Activate enrollment for a user in a course' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: {
          type: 'string',
          description: 'ID del usuario'
        },
        courseId: {
          type: 'string',
          description: 'ID del curso'
        }
      },
      required: ['userId', 'courseId']
    }
  })
  async activateEnrollment(
    @Body() body: { userId: string; courseId: string }
  ) {
    const enrollment = await this.enrollmentsService.activate(body.userId, body.courseId)
    return {
      success: true,
      message: 'Inscripción activada correctamente',
      enrollment
    }
  }
}
