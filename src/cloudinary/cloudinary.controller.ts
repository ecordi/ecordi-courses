import { Controller, Post, Body, UseGuards, Get, Param, Query } from '@nestjs/common'
import { CloudinaryService } from './cloudinary.service'
import { ApiBearerAuth, ApiOperation, ApiTags, ApiParam, ApiQuery } from '@nestjs/swagger'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { Roles } from '../common/decorators/roles.decorator'
import { RolesGuard } from '../common/guards/roles.guard'

@ApiTags('Cloudinary')
@Controller('cloudinary')
export class CloudinaryController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post('signature')
  @ApiOperation({ summary: 'Generate upload signature for Cloudinary (Admin only)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  signUpload(@Body() body: { folder: string; publicId?: string }) {
    return this.cloudinaryService.signUpload(body)
  }
  
 
  
  @Get('url/:publicId')
  @ApiOperation({ summary: 'Get Cloudinary URL for a public ID' })
  @ApiParam({ name: 'publicId', description: 'Public ID of the resource in Cloudinary' })
  @ApiQuery({ name: 'transformation', required: false, description: 'Cloudinary transformation string' })
  getUrl(
    @Param('publicId') publicId: string,
    @Query('transformation') transformation?: string
  ) {
    return this.cloudinaryService.getUrl(publicId, transformation)
  }
  
}
