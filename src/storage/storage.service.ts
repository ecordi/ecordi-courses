import { Injectable } from '@nestjs/common'
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { createPresignedPost } from '@aws-sdk/s3-presigned-post'

@Injectable()
export class StorageService {
  private s3: S3Client
  private bucket: string
  constructor() {
    this.s3 = new S3Client({
      region: process.env.AWS_REGION,
      credentials: { accessKeyId: process.env.AWS_ACCESS_KEY_ID as string, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string }
    })
    this.bucket = process.env.S3_BUCKET_PRIVATE as string
  }

  async getSignedUploadUrl(key: string, contentType: string, expiresInSec = 300) {
    const cmd = new PutObjectCommand({ Bucket: this.bucket, Key: key, ContentType: contentType })
    const url = await getSignedUrl(this.s3, cmd, { expiresIn: expiresInSec })
    return { method: 'PUT', url, key, expiresIn: expiresInSec, headers: { 'Content-Type': contentType } }
  }

  async getPresignedPost(key: string, contentType: string, expiresInSec = 300, maxSizeBytes = 104857600) {
    const { url, fields } = await createPresignedPost(this.s3, {
      Bucket: this.bucket,
      Key: key,
      Conditions: [['content-length-range', 0, maxSizeBytes], { 'Content-Type': contentType }],
      Expires: expiresInSec
    })
    return { method: 'POST', url, fields, key, expiresIn: expiresInSec }
  }

  async getSignedReadUrl(key: string, expiresInSec = 300) {
    const cmd = new GetObjectCommand({ Bucket: this.bucket, Key: key })
    return getSignedUrl(this.s3, cmd, { expiresIn: expiresInSec })
  }
}