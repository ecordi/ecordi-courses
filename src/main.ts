import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe, Logger } from '@nestjs/common'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import { corsConfig } from './config/cors.config'
import { AuditInterceptor } from './common/interceptors/audit.interceptor'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true })
  const appLogger = new Logger('App')
  app.useLogger(appLogger)
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidUnknownValues: true }))
  app.use(cookieParser())
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))
  app.enableCors(corsConfig)
  const httpLogger = new Logger('HTTP')
  app.useGlobalInterceptors(new AuditInterceptor(httpLogger))
  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('Courses API')
    .setDescription('API para la plataforma de cursos')
    .setVersion('1.0')
    .addBearerAuth()
    .build()
  
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, document)

  await app.listen(process.env.PORT || 3000)
}
bootstrap()