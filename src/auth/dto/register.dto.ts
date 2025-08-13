import { IsEmail, IsString, MinLength } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
export class RegisterDto {
  @ApiProperty({ example: 'Juan Pérez' })
  @IsString() name: string

  @ApiProperty({ example: 'juan@example.com' })
  @IsEmail() email: string

  @ApiProperty({ example: 'Secret123!' })
  @IsString() @MinLength(6) password: string
}