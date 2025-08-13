import { Injectable } from '@nestjs/common'
import * as crypto from 'crypto'

@Injectable()
export class CloudinaryService {
  signUpload(params: { publicId?: string; folder?: string; resourceType?: 'image' | 'video' | 'raw'; timestamp?: number }) {
    const ts = params.timestamp || Math.floor(Date.now() / 1000)
    const folder = params.folder || process.env.CLOUDINARY_FOLDER_PRIVATE || 'course-materials'
    const toSign: Record<string, any> = { timestamp: ts, folder }
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
      signature
    }
  }
}