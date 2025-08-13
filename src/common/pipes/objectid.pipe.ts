import { BadRequestException, PipeTransform } from '@nestjs/common'
import { isValidObjectId } from 'mongoose'

export class ObjectIdPipe implements PipeTransform<string, string> {
  transform(value: string) {
    if (!isValidObjectId(value)) throw new BadRequestException('Id inválido')
    return value
  }
}