import { IsString, IsIn, IsOptional, IsNumber } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateMaterialDto {
  @ApiProperty({ example: 'PDF', enum: ['PDF','IMG','VIDEO'] })
  @IsIn(['PDF','IMG','VIDEO']) type: 'PDF' | 'IMG' | 'VIDEO'

  @ApiPropertyOptional({ example: 'uploads/course1/intro.pdf' })
  @IsOptional() @IsString() storageKey?: string

  @ApiPropertyOptional({ example: 'https://cdn.example.com/files/intro.pdf' })
  @IsOptional() @IsString() externalUrl?: string

  @ApiPropertyOptional({ example: 102400 })
  @IsOptional() @IsNumber() sizeBytes?: number

  @ApiPropertyOptional({ example: 'sha256:abcd1234' })
  @IsOptional() @IsString() checksum?: string
}

export class UpdateMaterialDto {
  @ApiPropertyOptional({ example: 'IMG', enum: ['PDF','IMG','VIDEO'] })
  @IsOptional() @IsIn(['PDF','IMG','VIDEO']) type?: 'PDF' | 'IMG' | 'VIDEO'

  @ApiPropertyOptional({ example: 'uploads/course1/cover.png' })
  @IsOptional() @IsString() storageKey?: string

  @ApiPropertyOptional({ example: 'https://cdn.example.com/images/cover.png' })
  @IsOptional() @IsString() externalUrl?: string

  @ApiPropertyOptional({ example: 204800 })
  @IsOptional() @IsNumber() sizeBytes?: number

  @ApiPropertyOptional({ example: 'sha256:efgh5678' })
  @IsOptional() @IsString() checksum?: string
}

/**
 * DTO para crear un material con subida a Cloudinary
 */
export class CreateMaterialWithCloudinaryDto {
  @ApiProperty({ example: 'IMG', enum: ['PDF','IMG','VIDEO'], description: 'Tipo de material' })
  @IsIn(['PDF','IMG','VIDEO']) type: 'PDF' | 'IMG' | 'VIDEO'
  
  @ApiPropertyOptional({ 
    example: 'curso-introduccion/unidad1/portada', 
    description: 'ID público personalizado para Cloudinary (opcional)' 
  })
  @IsOptional() @IsString() cloudinaryPublicId?: string
  
  @ApiPropertyOptional({ example: 204800, description: 'Tamaño del archivo en bytes' })
  @IsOptional() @IsNumber() sizeBytes?: number
  
  @ApiPropertyOptional({ example: 'sha256:efgh5678', description: 'Checksum del archivo para verificación' })
  @IsOptional() @IsString() checksum?: string
}