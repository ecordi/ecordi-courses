import { Injectable } from '@nestjs/common'
import * as crypto from 'crypto'
import { v2 as cloudinary } from 'cloudinary'

@Injectable()
export class CloudinaryService {
  constructor() {
    // Configurar Cloudinary con las credenciales del .env
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true
    })
  }
  signUpload(params: { publicId?: string; folder?: string; resourceType?: 'image' | 'video' | 'raw'; timestamp?: number }) {
    const ts = params.timestamp || Math.floor(Date.now() / 1000)
    const folder = params.folder || process.env.CLOUDINARY_FOLDER_PRIVATE || 'course-materials'
    const resourceType = params.resourceType || 'auto'
    const toSign: Record<string, any> = { timestamp: ts, folder, resource_type: resourceType }
    if (params.publicId) toSign.public_id = params.publicId
    const ordered = Object.keys(toSign).sort().map(k => `${k}=${toSign[k]}`).join('&')
    const raw = `${ordered}${process.env.CLOUDINARY_API_SECRET}`
    const signature = crypto.createHash('sha1').update(raw).digest('hex')
    return {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      timestamp: ts,
      folder,
      publicId: params.publicId,
      resourceType,
      signature
    }
  }
  
  /**
   * Obtiene la URL de un recurso en Cloudinary
   * @param publicId ID público del recurso en Cloudinary
   * @param transformation Transformación de Cloudinary (opcional)
   * @returns URL del recurso
   */
  /**
   * Obtiene la URL de un recurso en Cloudinary
   * @param publicId ID público del recurso en Cloudinary
   * @param transformation Transformación de Cloudinary (opcional)
   * @returns URL del recurso
   */
  getUrl(publicId: string, transformation?: string): { url: string } {
    // Construir opciones de transformación si se proporcionan
    const options: Record<string, any> = {
      secure: true // Siempre usar HTTPS
    }
    
    if (transformation) {
      options.transformation = transformation
    }
    
    // Generar URL usando la API de Cloudinary
    const url = cloudinary.url(publicId, options)
    
    return { url }
  }
  
  /**
   * Obtiene la URL de un recurso en Cloudinary basado en su tipo
   * @param publicId ID público del recurso
   * @param type Tipo de material (PDF, IMG, VIDEO)
   * @returns URL del recurso con transformaciones apropiadas según el tipo
   */
  getMaterialUrl(publicId: string, type: 'PDF' | 'IMG' | 'VIDEO'): { url: string } {
    let transformation = ''
    
    switch (type) {
      case 'IMG':
        // Para imágenes, podemos aplicar transformaciones como redimensionamiento
        transformation = 'q_auto,f_auto'
        break
      case 'VIDEO':
        // Para videos, podemos aplicar transformaciones como calidad automática
        transformation = 'q_auto'
        break
      case 'PDF':
        // Para PDFs, podemos aplicar transformaciones específicas si es necesario
        transformation = 'fl_attachment'
        break
    }
    
    return this.getUrl(publicId, transformation)
  }
  
  /**
   * Sube un archivo directamente a Cloudinary
   * @param file Archivo a subir (Buffer)
   * @param options Opciones de subida (folder, public_id, resource_type)
   * @returns Resultado de la subida con URL y public_id
   */
  async uploadFile(file: Buffer, options: { folder?: string; publicId?: string; resourceType?: string }): Promise<any> {
    return new Promise((resolve, reject) => {
      // Configurar opciones de subida
      const uploadOptions: any = {
        folder: options.folder || process.env.CLOUDINARY_FOLDER_PRIVATE || 'course-materials',
        resource_type: options.resourceType || 'auto'
      }
      
      if (options.publicId) {
        uploadOptions.public_id = options.publicId
      }
      
      // Crear un stream de subida a Cloudinary
      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) return reject(error)
          resolve(result)
        }
      )
      
      // Convertir el buffer a un stream y enviarlo a Cloudinary
      const bufferStream = require('stream')
      const readable = new bufferStream.Readable()
      readable._read = () => {} // _read es requerido pero puede estar vacío
      readable.push(file)
      readable.push(null)
      readable.pipe(uploadStream)
    })
  }
}