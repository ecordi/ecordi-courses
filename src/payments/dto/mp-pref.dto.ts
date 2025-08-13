import { ApiProperty } from '@nestjs/swagger'
import { IsMongoId, IsString } from 'class-validator'

export class CreateMpPreferenceDto {
  @ApiProperty({ example: '66b8b0b2b1a4d4e5f6a7b8c9', description: 'ID del curso (MongoID)' })
  @IsMongoId()
  @IsString()
  courseId!: string
}
