import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Course, CourseSchema } from '../db/schemas/course.schema'
import { Unit, UnitSchema } from '../db/schemas/unit.schema'
import { Material, MaterialSchema } from '../db/schemas/material.schema'
import { Enrollment, EnrollmentSchema } from '../db/schemas/enrollment.schema'
import { CoursesController } from './courses.controller'
import { CoursesService } from './courses.service'
import { StorageModule } from '../storage/storage.module'
import { EnrollmentsModule } from '../enrollments/enrollments.module'
import { EnrollmentGuard } from './guards/enrollment.guard'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Course.name, schema: CourseSchema },
      { name: Unit.name, schema: UnitSchema },
      { name: Material.name, schema: MaterialSchema },
      { name: Enrollment.name, schema: EnrollmentSchema }
    ]),
    StorageModule,
    EnrollmentsModule
  ],
  controllers: [CoursesController],
  providers: [CoursesService, EnrollmentGuard],
  exports: [CoursesService, MongooseModule]
})
export class CoursesModule {}