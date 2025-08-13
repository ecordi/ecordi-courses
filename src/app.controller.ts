// src/health/health.controller.ts
import { Controller, Get } from '@nestjs/common';

@Controller('')
export class HealthController {
  constructor() {}

  @Get()
  check() {
    return {status: 'ok'}
  }
}
