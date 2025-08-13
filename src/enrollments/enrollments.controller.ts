import { Controller, Get, UseGuards, Req } from '@nestjs/common'
import { EnrollmentsService } from './enrollments.service'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'

@ApiTags('Enrollments')
@ApiBearerAuth()
@Controller('enrollments')
@UseGuards(JwtAuthGuard)
export class EnrollmentsController {
  constructor(private readonly service: EnrollmentsService) {}
  @Get('my')
  @ApiOperation({ summary: 'List my enrollments' })
  async my(@Req() req: any) { return this.service.my(req.user.userId) }
}