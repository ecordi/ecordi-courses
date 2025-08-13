import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Observable, tap } from 'rxjs'
import { randomUUID } from 'crypto'
import { Logger } from '@nestjs/common'

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly logger: Logger) {}
  intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
    const req = ctx.switchToHttp().getRequest()
    req.auditId = req.auditId || randomUUID()
    const start = Date.now()
    return next.handle().pipe(
      tap({
        next: () => {
          this.logger.log({
            msg: 'http_request',
            auditId: req.auditId,
            method: req.method,
            url: req.originalUrl || req.url,
            userId: req.user?.userId,
            ms: Date.now() - start
          })
        },
        error: (e) => {
          this.logger.error({
            msg: 'http_error',
            auditId: req.auditId,
            method: req.method,
            url: req.originalUrl || req.url,
            userId: req.user?.userId,
            ms: Date.now() - start,
            err: { name: e.name, message: e.message }
          })
        }
      })
    )
  }
}