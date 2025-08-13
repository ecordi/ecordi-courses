import { IsString, IsNumber, IsOptional, Min, IsEnum } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { CourseCategory } from '../../db/schemas/course.schema'

export class CreateCourseDto {
  @ApiProperty({ example: 'Curso de NestJS' })
  @IsString() title: string

  @ApiProperty({ example: 'Aprende NestJS desde cero' })
  @IsString() description: string

  @ApiProperty({ example: 49.99 })
  @IsNumber() @Min(0) priceUsd: number

  @ApiPropertyOptional({ example: 'https://cdn.example.com/covers/nestjs.png' })
  @IsOptional() @IsString() coverUrl?: string

  @ApiProperty({ 
    example: 'PROGRAMMING', 
    enum: CourseCategory, 
    description: 'Categoría del curso' 
  })
  @IsEnum(CourseCategory) category: CourseCategory
}

export class UpdateCourseDto {
  @ApiPropertyOptional({ example: 'Curso de NestJS Avanzado' })
  @IsOptional() @IsString() title?: string

  @ApiPropertyOptional({ example: 'Incluye JWT, Guards y más' })
  @IsOptional() @IsString() description?: string

  @ApiPropertyOptional({ example: 59.99 })
  @IsOptional() @IsNumber() @Min(0) priceUsd?: number

  @ApiPropertyOptional({ example: 'https://cdn.example.com/covers/nestjs-adv.png' })
  @IsOptional() @IsString() coverUrl?: string

  @ApiPropertyOptional({ example: 'ACTIVE', enum: ['ACTIVE','INACTIVE'] })
  @IsOptional() @IsString() status?: 'ACTIVE' | 'INACTIVE'
  
  @ApiPropertyOptional({ 
    example: 'PROGRAMMING', 
    enum: CourseCategory, 
    description: 'Categoría del curso' 
  })
  @IsOptional() @IsEnum(CourseCategory) category?: CourseCategory
}