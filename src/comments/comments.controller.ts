import { Controller, Get, Post, Delete, Body, Param, UseGuards, Req } from '@nestjs/common'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { EnrollmentGuard } from '../courses/guards/enrollment.guard'
import { CommentsService } from './comments.service'
import { ApiBearerAuth, ApiOperation, ApiTags, ApiBody } from '@nestjs/swagger'
import { ObjectIdPipe } from '../common/pipes/objectid.pipe'
import { Roles } from '../common/decorators/roles.decorator'
import { RolesGuard } from '../common/guards/roles.guard'

@ApiTags('Comments')
@ApiBearerAuth()
@Controller('comments')
@UseGuards(JwtAuthGuard)
export class CommentsController {
  constructor(private readonly service: CommentsService) {}

  @Post('materials/:materialId')
  @UseGuards(EnrollmentGuard)
  @ApiOperation({ summary: 'Create a comment for a material' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        content: {
          type: 'string',
          description: 'Comment content'
        },
        parentId: {
          type: 'string',
          description: 'Parent comment ID (for replies)'
        }
      },
      required: ['content']
    }
  })
  async createComment(
    @Req() req: any,
    @Param('materialId', ObjectIdPipe) materialId: string,
    @Body() body: { content: string; parentId?: string }
  ) {
    const userId = req.user.userId
    const isInstructor = req.user.roles?.includes('INSTRUCTOR') || false
    
    return this.service.createComment(
      userId,
      materialId,
      body.content,
      isInstructor,
      body.parentId
    )
  }

  @Get('materials/:materialId')
  @UseGuards(EnrollmentGuard)
  @ApiOperation({ summary: 'Get comments for a material' })
  async getComments(
    @Param('materialId', ObjectIdPipe) materialId: string
  ) {
    return this.service.getCommentsByMaterial(materialId)
  }

  @Get(':commentId/replies')
  @UseGuards(EnrollmentGuard)
  @ApiOperation({ summary: 'Get replies for a comment' })
  async getReplies(
    @Param('commentId', ObjectIdPipe) commentId: string
  ) {
    return this.service.getReplies(commentId)
  }

  @Post(':commentId/like')
  @UseGuards(EnrollmentGuard)
  @ApiOperation({ summary: 'Like a comment' })
  async likeComment(
    @Req() req: any,
    @Param('commentId', ObjectIdPipe) commentId: string
  ) {
    const userId = req.user.userId
    return this.service.likeComment(commentId, userId)
  }

  @Post(':commentId/unlike')
  @UseGuards(EnrollmentGuard)
  @ApiOperation({ summary: 'Unlike a comment' })
  async unlikeComment(
    @Req() req: any,
    @Param('commentId', ObjectIdPipe) commentId: string
  ) {
    const userId = req.user.userId
    return this.service.unlikeComment(commentId, userId)
  }

  @Delete(':commentId')
  @UseGuards(EnrollmentGuard)
  @ApiOperation({ summary: 'Delete a comment' })
  async deleteComment(
    @Req() req: any,
    @Param('commentId', ObjectIdPipe) commentId: string
  ) {
    const userId = req.user.userId
    const isAdmin = req.user.roles?.includes('ADMIN') || false
    
    return this.service.deleteComment(commentId, userId, isAdmin)
  }
}
