import { Module } from '@nestjs/common'
import { StorageModule } from '../storage/storage.module'
import { CloudinaryModule } from '../cloudinary/cloudinary.module'
import { EnrollmentsModule } from '../enrollments/enrollments.module'
import { MongooseModule } from '@nestjs/mongoose'
import { Course, CourseSchema } from '../db/schemas/course.schema'
import { Unit, UnitSchema } from '../db/schemas/unit.schema'
import { Material, MaterialSchema } from '../db/schemas/material.schema'
import { AdminService } from './services/admin.service'
import { AdminCoursesController } from './controllers/admin.courses.controller'
import { AdminUnitsController } from './controllers/admin.units.controller'
import { AdminMaterialsController } from './controllers/admin.materials.controller'
import { AdminUploadController } from './controllers/admin.upload.controller'
import { AdminEnrollmentsController } from './controllers/admin.enrollments.controller'

@Module({
  imports: [
    StorageModule,
    CloudinaryModule,
    EnrollmentsModule,
    MongooseModule.forFeature([
      { name: Course.name, schema: CourseSchema },
      { name: Unit.name, schema: UnitSchema },
      { name: Material.name, schema: MaterialSchema },
    ]),
  ],
  providers: [AdminService],
  controllers: [
    AdminCoursesController, 
    AdminUnitsController, 
    AdminMaterialsController, 
    AdminUploadController,
    AdminEnrollmentsController
  ],
})
export class AdminModule {}