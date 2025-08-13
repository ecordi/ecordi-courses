import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface'

export const corsConfig: CorsOptions = {
  origin: (origin, cb) => {
    const allowed = (process.env.CORS_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean)
    if (!origin || allowed.includes(origin)) cb(null, true)
    else cb(new Error('CORS not allowed'), false)
  },
  credentials: true
}