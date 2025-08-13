import { Body, Controller, Delete, Param, Patch, Post, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'

@ApiTags('Admin/Materials')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller()
export class AdminMaterialsController {
  @Post('admin/units/:unitId/materials')
  @ApiOperation({ summary: 'Add material to unit' })
  @ApiParam({ name: 'unitId' })
  @ApiOkResponse({ schema: { example: { id: 'material1', unitId: 'unit1' } } })
  create(@Param('unitId') unitId: string, @Body() _body: any) {
    return { id: 'material1', unitId }
  }

  @Patch('admin/materials/:id')
  @ApiOperation({ summary: 'Update material' })
  @ApiParam({ name: 'id' })
  @ApiOkResponse({ schema: { example: { id: 'material1', updated: true } } })
  update(@Param('id') id: string, @Body() _body: any) {
    return { id, updated: true }
  }

  @Delete('admin/materials/:id')
  @ApiOperation({ summary: 'Delete material' })
  @ApiParam({ name: 'id' })
  @ApiOkResponse({ schema: { example: { id: 'material1', deleted: true } } })
  delete(@Param('id') id: string) {
    return { id, deleted: true }
  }
}
