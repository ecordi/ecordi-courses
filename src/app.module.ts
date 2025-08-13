import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import appConfig from './config/app.config'
import mongoConfig from './config/mongo.config'
import s3Config from './config/s3.config'
import { MongooseModule } from '@nestjs/mongoose'
import { AuthModule } from './auth/auth.module'
import { CoursesModule } from './courses/courses.module'
import { EnrollmentsModule } from './enrollments/enrollments.module'
import { PaymentsModule } from './payments/payments.module'
import { StorageModule } from './storage/storage.module'
import { AdminModule } from './admin/admin.module'
import { ProgressModule } from './progress/progress.module'
import { CommentsModule } from './comments/comments.module'
import { CategoriesModule } from './categories/categories.module'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'
import { APP_GUARD } from '@nestjs/core'
import { LoggerModule } from 'nestjs-pino'
import { HealthController } from './app.controller'

@Module({
  imports: [
    ConfigModule.forRoot({ 
      isGlobal: true, 
      envFilePath: '.env',
      load: [appConfig, mongoConfig, s3Config] 
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI as string),
    LoggerModule.forRoot({
      pinoHttp: {
        transport: process.env.NODE_ENV === 'development' ? { target: 'pino-pretty' } : undefined,
        redact: ['req.headers.authorization', 'req.headers.cookie'],
      },
    }),
    ThrottlerModule.forRoot([
      { ttl: 60, limit: 120 },
      { name: 'payments', ttl: 60, limit: 20 },
    ]),
    AuthModule,
    CoursesModule,
    EnrollmentsModule,
    PaymentsModule,
    StorageModule,
    AdminModule,
    ProgressModule,
    CommentsModule,
    CategoriesModule,
    
  ],
  controllers: [HealthController],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard },],
})
export class AppModule {}
