import { Body, Controller, Delete, Param, Patch, Post, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'

@ApiTags('Admin/Units')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller()
export class AdminUnitsController {
  @Post('admin/courses/:courseId/units')
  @ApiOperation({ summary: 'Create unit for course' })
  @ApiParam({ name: 'courseId' })
  @ApiOkResponse({ schema: { example: { id: 'unit1', courseId: 'course1' } } })
  create(@Param('courseId') courseId: string, @Body() _body: any) {
    return { id: 'unit1', courseId }
  }

  @Patch('admin/units/:id')
  @ApiOperation({ summary: 'Update unit' })
  @ApiParam({ name: 'id' })
  @ApiOkResponse({ schema: { example: { id: 'unit1', updated: true } } })
  update(@Param('id') id: string, @Body() _body: any) {
    return { id, updated: true }
  }

  @Delete('admin/units/:id')
  @ApiOperation({ summary: 'Delete unit' })
  @ApiParam({ name: 'id' })
  @ApiOkResponse({ schema: { example: { id: 'unit1', deleted: true } } })
  delete(@Param('id') id: string) {
    return { id, deleted: true }
  }
}
