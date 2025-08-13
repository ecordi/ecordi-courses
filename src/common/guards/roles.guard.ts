import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ROLES_KEY } from '../decorators/roles.decorator'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Array<'ADMIN' | 'STUDENT'>>(ROLES_KEY, [
      context.getHandler(),
      context.getClass()
    ])
    if (!required || required.length === 0) return true
    const req = context.switchToHttp().getRequest()
    const role = req.user?.role
    if (!role || !required.includes(role)) throw new ForbiddenException('Permisos insuficientes')
    return true
  }
}