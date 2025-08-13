import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { Roles } from '../../common/decorators/roles.decorator'
import { RolesGuard } from '../../common/guards/roles.guard'

@ApiTags('Admin/Courses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin/courses')
export class AdminCoursesController {
  @Post()
  @ApiOperation({ summary: 'Create course' })
  @ApiOkResponse({ schema: { example: { id: 'course1' } } })
  create(@Body() _body: any) {
    return { id: 'course1' }
  }

  @Get()
  @ApiOperation({ summary: 'List courses' })
  @ApiOkResponse({ schema: { example: [{ id: 'course1' }] } })
  list() {
    return [{ id: 'course1' }]
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get course by id' })
  @ApiParam({ name: 'id' })
  @ApiOkResponse({ schema: { example: { id: 'course1' } } })
  get(@Param('id') id: string) {
    return { id }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update course' })
  @ApiParam({ name: 'id' })
  @ApiOkResponse({ schema: { example: { id: 'course1', updated: true } } })
  update(@Param('id') id: string, @Body() _body: any) {
    return { id, updated: true }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete course' })
  @ApiParam({ name: 'id' })
  @ApiOkResponse({ schema: { example: { id: 'course1', deleted: true } } })
  delete(@Param('id') id: string) {
    return { id, deleted: true }
  }
}
