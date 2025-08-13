import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { PaymentsService } from './payments.service'
import { PaymentsController } from './payments.controller'
import { Payment, PaymentSchema } from '../db/schemas/payment.schema'
import { Enrollment, EnrollmentSchema } from '../db/schemas/enrollment.schema'
import { WebhookEvent, WebhookEventSchema } from '../db/schemas/webhook-event.schema'
import { Course, CourseSchema } from '../db/schemas/course.schema'
import { EnrollmentsModule } from '../enrollments/enrollments.module'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Payment.name, schema: PaymentSchema },
      { name: Enrollment.name, schema: EnrollmentSchema },
      { name: WebhookEvent.name, schema: WebhookEventSchema },
      { name: Course.name, schema: CourseSchema },
    ]),
    EnrollmentsModule,
  ],
  providers: [PaymentsService],
  controllers: [PaymentsController],
  exports: [PaymentsService]
})
export class PaymentsModule {}