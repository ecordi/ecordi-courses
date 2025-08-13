import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Enrollment, EnrollmentSchema } from '../db/schemas/enrollment.schema'
import { EnrollmentsService } from './enrollments.service'
import { EnrollmentsController } from './enrollments.controller'

@Module({
  imports: [MongooseModule.forFeature([{ name: Enrollment.name, schema: EnrollmentSchema }])],
  providers: [EnrollmentsService],
  controllers: [EnrollmentsController],
  exports: [EnrollmentsService, MongooseModule]
})
export class EnrollmentsModule {}