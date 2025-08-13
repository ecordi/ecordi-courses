import { Injectable, ExecutionContext } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { Observable } from 'rxjs'

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    // For Swagger documentation and testing in development
    if (process.env.NODE_ENV === 'development') {
      const request = context.switchToHttp().getRequest()
      if (!request.headers.authorization) {
        // Mock user for development
        request.user = { userId: '000000000000000000000000', email: 'test@example.com' }
        return true
      }
    }
    return super.canActivate(context)
  }
}
