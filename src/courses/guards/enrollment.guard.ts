import { CanActivate, ExecutionContext, Injectable, ForbiddenException, Inject } from '@nestjs/common'
import { Observable } from 'rxjs'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { Enrollment, EnrollmentDocument } from '../../db/schemas/enrollment.schema'
import { getModelToken } from '@nestjs/mongoose'

@Injectable()
export class EnrollmentGuard implements CanActivate {
  constructor(
    @Inject(getModelToken(Enrollment.name)) private enrollmentModel: Model<EnrollmentDocument>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const user = request.user
    const courseId = request.params.courseId

    // For Swagger documentation and testing
    if (process.env.NODE_ENV === 'development' && !user) {
      return true
    }

    if (!user || !user.userId) {
      throw new ForbiddenException('No autorizado')
    }

    if (!courseId || !Types.ObjectId.isValid(courseId)) {
      throw new ForbiddenException('Curso inválido')
    }

    // Check if user is enrolled in the course
    const enrollment = await this.enrollmentModel.findOne({
      userId: new Types.ObjectId(user.userId),
      courseId: new Types.ObjectId(courseId),
      status: 'ACTIVE',
    }).exec()

    if (!enrollment) {
      throw new ForbiddenException('No estás inscrito en este curso')
    }

    return true
  }
}
