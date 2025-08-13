import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Progress, ProgressSchema } from '../db/schemas/progress.schema'
import { ProgressService } from '../progress/progress.service'
import { ProgressController } from '../progress/progress.controller'
import { CoursesModule } from '../courses/courses.module'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Progress.name, schema: ProgressSchema },
    ]),
    CoursesModule
  ],
  providers: [ProgressService],
  controllers: [ProgressController],
  exports: [ProgressService]
})
export class ProgressModule {}
