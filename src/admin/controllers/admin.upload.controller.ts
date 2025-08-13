import { Controller, UseGuards, Post, Body } from '@nestjs/common'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'
import { StorageService } from '../../storage/storage.service'
import { CloudinaryService } from '../../cloudinary/cloudinary.service'
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger'

@ApiTags('Admin/Upload')
@ApiBearerAuth()
@Controller('admin/upload')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminUploadController {
  constructor(private readonly storage: StorageService, private readonly cloud: CloudinaryService) {}

  @Post('s3-url')
  @ApiOperation({ summary: 'Get S3 signed PUT URL' })
  @ApiBody({ schema: { example: { key: 'uploads/course1/intro.pdf', contentType: 'application/pdf', expiresInSec: 300 } } })
  async s3url(@Body() body: { key: string; contentType: string; expiresInSec?: number }) {
    return this.storage.getSignedUploadUrl(body.key, body.contentType, body.expiresInSec || 300)
  }

  @Post('s3-post')
  @ApiOperation({ summary: 'Get S3 presigned POST policy' })
  @ApiBody({ schema: { example: { key: 'uploads/course1/video.mp4', contentType: 'video/mp4', expiresInSec: 600, maxSizeBytes: 104857600 } } })
  async s3post(@Body() body: { key: string; contentType: string; expiresInSec?: number; maxSizeBytes?: number }) {
    return this.storage.getPresignedPost(body.key, body.contentType, body.expiresInSec || 300, body.maxSizeBytes || 104857600)
  }

  @Post('cloudinary-sign')
  @ApiOperation({ summary: 'Get Cloudinary upload signature' })
  @ApiBody({ schema: { example: { publicId: 'courses/course1/cover', folder: 'courses', resourceType: 'image' } } })
  async cloudinary(@Body() body: { publicId?: string; folder?: string; resourceType?: 'image' | 'video' | 'raw' }) {
    return this.cloud.signUpload(body)
  }
}