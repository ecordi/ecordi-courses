import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Comment, CommentSchema } from '../db/schemas/comment.schema'
import { CommentsService } from './comments.service'
import { CommentsController } from './comments.controller'
import { CoursesModule } from '../courses/courses.module'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Comment.name, schema: CommentSchema },
    ]),
    CoursesModule
  ],
  providers: [CommentsService],
  controllers: [CommentsController],
  exports: [CommentsService]
})
export class CommentsModule {}
