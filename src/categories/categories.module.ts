import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { CategoriesController } from './categories.controller'
import { CategoriesService } from './categories.service'
import { Course, CourseSchema } from '../db/schemas/course.schema'
import { Category, CategorySchema } from '../db/schemas/category.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Course.name, schema: CourseSchema },
      { name: Category.name, schema: CategorySchema }
    ])
  ],
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService]
})
export class CategoriesModule {}
