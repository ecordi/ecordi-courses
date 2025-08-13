import { IsEmail, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
export class LoginDto {
  @ApiProperty({ example: 'juan@example.com' })
  @IsEmail() email: string

  @ApiProperty({ example: 'Secret123!' })
  @IsString() password: string
}