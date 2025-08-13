import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsNumber, IsOptional, IsMongoId, Min } from 'class-validator'

export class UnitResponseDto {
  @ApiProperty({ example: '64f0e1d5c57e4b001c3d7c02' })
  id: string

  @ApiProperty({ example: 'Introducción a Node.js' })
  title: string

  @ApiProperty({ example: 'Fundamentos básicos de Node.js' })
  description?: string

  @ApiProperty({ example: '64f0e1d5c57e4b001c3d7c01' })
  courseId: string

  @ApiProperty({ example: 1 })
  order: number

  @ApiProperty({ example: ['64f0e1d5c57e4b001c3d7c03'] })
  materials?: string[]
}

export class CreateUnitDto {
  @ApiProperty({ example: 'Introducción a Node.js' })
  @IsString()
  title: string

  @ApiProperty({ example: 'Fundamentos básicos de Node.js' })
  @IsString()
  @IsOptional()
  description?: string

  @ApiProperty({ example: '64f0e1d5c57e4b001c3d7c01' })
  @IsMongoId()
  courseId: string

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  order?: number
}

export class UpdateUnitDto {
  @ApiProperty({ example: 'Introducción a Node.js' })
  @IsString()
  @IsOptional()
  title?: string

  @ApiProperty({ example: 'Fundamentos básicos de Node.js' })
  @IsString()
  @IsOptional()
  description?: string

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  order?: number
}
