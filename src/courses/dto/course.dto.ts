import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsNumber, IsOptional, IsBoolean, IsMongoId, Min, IsEnum } from 'class-validator'
import { CourseCategory } from '../../db/schemas/course.schema'

export class CourseResponseDto {
  @ApiProperty({ example: '64f0e1d5c57e4b001c3d7c01' })
  id: string

  @ApiProperty({ example: 'Curso de Node.js' })
  title: string

  @ApiProperty({ example: 'Aprende Node.js desde cero' })
  description?: string

  @ApiProperty({ example: 'https://example.com/image.jpg' })
  image?: string

  @ApiProperty({ example: 49.99 })
  price: number

  @ApiProperty({ example: true })
  active: boolean

  @ApiProperty({ example: ['64f0e1d5c57e4b001c3d7c02'] })
  units?: string[]
  
  @ApiProperty({ 
    example: 'PROGRAMMING', 
    enum: CourseCategory, 
    description: 'Categoría del curso' 
  })
  category: CourseCategory
}

export class CreateCourseDto {
  @ApiProperty({ example: 'Curso de Node.js' })
  @IsString()
  title: string

  @ApiProperty({ example: 'Aprende Node.js desde cero' })
  @IsString()
  @IsOptional()
  description?: string

  @ApiProperty({ example: 'https://example.com/image.jpg' })
  @IsString()
  @IsOptional()
  image?: string

  @ApiProperty({ example: 49.99 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number

  @ApiProperty({ example: true })
  @IsBoolean()
  @IsOptional()
  active?: boolean
}

export class UpdateCourseDto {
  @ApiProperty({ example: 'Curso de Node.js' })
  @IsString()
  @IsOptional()
  title?: string

  @ApiProperty({ example: 'Aprende Node.js desde cero' })
  @IsString()
  @IsOptional()
  description?: string

  @ApiProperty({ example: 'https://example.com/image.jpg' })
  @IsString()
  @IsOptional()
  image?: string

  @ApiProperty({ example: 49.99 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number

  @ApiProperty({ example: true })
  @IsBoolean()
  @IsOptional()
  active?: boolean
}

export class CourseFilterDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  search?: string

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  active?: boolean
  
  @ApiProperty({ 
    required: false, 
    enum: CourseCategory, 
    description: 'Filtrar por categoría' 
  })
  @IsEnum(CourseCategory)
  @IsOptional()
  category?: CourseCategory
}
