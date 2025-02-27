import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export class S3Service {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly isProduction: boolean;

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.bucketName = process.env.AWS_S3_BUCKET_NAME || 'amp-music-storage';
    
    if (this.isProduction) {
      this.s3Client = new S3Client({
        region: process.env.AWS_S3_BUCKET_REGION || 'ap-northeast-2',
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        },
      });
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string,
  ): Promise<{ url: string }> {
    if (!this.isProduction) {
      // 개발 환경에서는 로컬 경로 반환
      return {
        url: `/${folder}/${file.filename}`,
      };
    }

    try {
      const key = `${folder}/${file.filename}`;
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await this.s3Client.send(command);

      // CloudFront URL 형식으로 반환
      return {
        url: `https://${process.env.AWS_CLOUD_FRONT_DOMAIN}/${key}`,
      };
    } catch (error) {
      console.error('S3 upload error:', error);
      throw new Error('파일 업로드 중 오류가 발생했습니다.');
    }
  }
} 