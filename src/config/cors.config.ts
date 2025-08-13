import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface'

// Configuración de CORS para producción y desarrollo
export const corsConfig: CorsOptions = {
  origin: (origin, callback) => {
    // Lista de dominios permitidos
    const allowedOrigins = [
      'https://v0-udemi-clone-rosa.vercel.app',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5173',
      'http://localhost:5174'
    ];
    
    // En desarrollo o para Postman/apps móviles (sin origen)
    if (!origin || process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // Verificar si el origen está en la lista de permitidos
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      // También permitir subdominios de vercel.app
      if (origin.endsWith('vercel.app')) {
        return callback(null, true);
      }
      return callback(new Error(`Origen no permitido: ${origin}`), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning', 'Accept', 'Origin']
}