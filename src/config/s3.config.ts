import { registerAs } from '@nestjs/config'
export default registerAs('s3', () => ({
  region: process.env.AWS_REGION as string,
  bucketPrivate: process.env.S3_BUCKET_PRIVATE as string,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string
}))