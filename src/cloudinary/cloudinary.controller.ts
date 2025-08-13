import { Controller, Post, Body, UseGuards } from '@nestjs/common'
import { CloudinaryService } from './cloudinary.service'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { Roles } from '../common/decorators/roles.decorator'

@ApiTags('Cloudinary')
@Controller('cloudinary')
export class CloudinaryController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post('signature')
  @ApiOperation({ summary: 'Generate upload signature for Cloudinary' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Roles('ADMIN')
  signUpload(@Body() body: { folder: string; publicId?: string }) {
    return this.cloudinaryService.signUpload(body)
  }
  
}
