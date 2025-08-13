import { Transform } from 'class-transformer'
import { IsInt, Min } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
export class PaginationDto {
  @ApiPropertyOptional({ example: 1, description: 'Page number (>=1)' })
  @Transform(({ value }) => parseInt(value ?? '1', 10))
  @IsInt() @Min(1)
  page: number = 1

  @ApiPropertyOptional({ example: 20, description: 'Items per page (>=1)' })
  @Transform(({ value }) => parseInt(value ?? '20', 10))
  @IsInt() @Min(1)
  pageSize: number = 20
}