import { IsString, IsNumber, IsOptional } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
export class CreateUnitDto {
  @ApiProperty({ example: 'Introducción' })
  @IsString() title: string

  @ApiPropertyOptional({ example: 1 })
  @IsOptional() @IsNumber() order?: number
}
export class UpdateUnitDto {
  @ApiPropertyOptional({ example: 'Setup del entorno' })
  @IsOptional() @IsString() title?: string

  @ApiPropertyOptional({ example: 2 })
  @IsOptional() @IsNumber() order?: number
}