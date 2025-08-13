import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator'

export class CreateCategoryDto {
  @ApiProperty({ description: 'Identificador único de la categoría', example: 'data-science' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(30)
  id: string

  @ApiProperty({ description: 'Nombre de la categoría', example: 'Data Science' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  name: string

  @ApiProperty({ description: 'Descripción de la categoría', example: 'Cursos de ciencia de datos, machine learning y análisis estadístico' })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(200)
  description: string
}
