import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsNumber, IsOptional, IsMongoId, IsEnum, Min } from 'class-validator'

export enum MaterialType {
  VIDEO = 'VIDEO',
  PDF = 'PDF',
  IMAGE = 'IMAGE',
  LINK = 'LINK',
  TEXT = 'TEXT',
}

export class MaterialResponseDto {
  @ApiProperty({ example: '64f0e1d5c57e4b001c3d7c03' })
  id: string

  @ApiProperty({ example: 'Introducción al curso' })
  title: string

  @ApiProperty({ example: 'Video introductorio' })
  description?: string

  @ApiProperty({ example: '64f0e1d5c57e4b001c3d7c02' })
  unitId: string

  @ApiProperty({ enum: MaterialType, example: MaterialType.VIDEO })
  type: MaterialType

  @ApiProperty({ example: 'videos/intro.mp4' })
  key: string

  @ApiProperty({ example: 1 })
  order: number
}

export class CreateMaterialDto {
  @ApiProperty({ example: 'Introducción al curso' })
  @IsString()
  title: string

  @ApiProperty({ example: 'Video introductorio' })
  @IsString()
  @IsOptional()
  description?: string

  @ApiProperty({ example: '64f0e1d5c57e4b001c3d7c02' })
  @IsMongoId()
  unitId: string

  @ApiProperty({ enum: MaterialType, example: MaterialType.VIDEO })
  @IsEnum(MaterialType)
  type: MaterialType

  @ApiProperty({ example: 'videos/intro.mp4' })
  @IsString()
  key: string

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  order?: number
}

export class UpdateMaterialDto {
  @ApiProperty({ example: 'Introducción al curso' })
  @IsString()
  @IsOptional()
  title?: string

  @ApiProperty({ example: 'Video introductorio' })
  @IsString()
  @IsOptional()
  description?: string

  @ApiProperty({ enum: MaterialType, example: MaterialType.VIDEO })
  @IsEnum(MaterialType)
  @IsOptional()
  type?: MaterialType

  @ApiProperty({ example: 'videos/intro.mp4' })
  @IsString()
  @IsOptional()
  key?: string

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  order?: number
}
