import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { extname, join } from 'path';
import sharp from 'sharp';
import { getAudioDurationInSeconds } from 'get-audio-duration';
import { AudioConverter } from './audio-converter';
import { promises as fs } from 'fs';
import { BadRequestException } from '@nestjs/common';

export interface FileValidationRules {
  maxSize: number;
  allowedMimeTypes: string[];
}

export const FILE_VALIDATION_RULES = {
  image: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'],
  },
  audio: {
    maxSize: 20 * 1024 * 1024, // 20MB
    allowedMimeTypes: ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/aac', 'audio/ogg'],
  },
  avatar: {
    maxSize: 2 * 1024 * 1024, // 2MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  },
} as const;

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

  private generateFileName(originalName: string, format?: string): string {
    const randomName = Array(32)
      .fill(null)
      .map(() => Math.round(Math.random() * 16).toString(16))
      .join('');
    
    const ext = format ? `.${format}` : extname(originalName);
    return `${randomName}${ext}`;
  }

  private async processImage(file: Express.Multer.File): Promise<{ buffer: Buffer; filename: string }> {
    const optimized = await sharp(file.buffer)
      .resize(800, 800, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 80 })
      .toBuffer();

    const filename = this.generateFileName(file.originalname, 'webp');
    return { buffer: optimized, filename };
  }

  private async processAudio(file: Express.Multer.File): Promise<{ buffer: Buffer; filename: string; duration: number }> {
    try {
      // 임시 디렉토리 경로 설정 (Docker 환경 고려)
      const tempDir = process.env.NODE_ENV === 'production'
        ? '/app/temp'
        : join(process.cwd(), 'temp');

      console.log('Processing audio file:', {
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        tempDir
      });

      // 임시 디렉토리 생성 시도
      try {
        await fs.mkdir(tempDir, { recursive: true });
        console.log('Temp directory created/verified:', tempDir);
      } catch (mkdirError) {
        console.error('Error creating temp directory:', mkdirError);
        throw new Error('임시 디렉토리 생성 실패');
      }
      
      const tempFileName = this.generateFileName(file.originalname);
      const tempInputPath = join(tempDir, `input-${tempFileName}`);
      const tempOutputPath = join(tempDir, `output-${tempFileName}.m4a`);

      console.log('Temp file paths:', {
        input: tempInputPath,
        output: tempOutputPath
      });

      // 버퍼를 임시 파일로 저장
      try {
        await fs.writeFile(tempInputPath, file.buffer);
        console.log('Input file written successfully');
      } catch (writeError) {
        console.error('Error writing input file:', writeError);
        throw new Error('입력 파일 저장 실패');
      }

      // AAC 변환
      try {
        const outputFileName = await AudioConverter.convertToAAC(tempInputPath, tempDir);
        console.log('Audio conversion completed:', outputFileName);
        // 실제 출력 파일 경로 업데이트
        const actualOutputPath = join(tempDir, outputFileName);
        
        // 변환된 파일 읽기 및 메타데이터 추출
        let convertedBuffer: Buffer;
        let duration: number;

        try {
          convertedBuffer = await fs.readFile(actualOutputPath);
          duration = await getAudioDurationInSeconds(actualOutputPath);
          console.log('Audio metadata extracted:', { duration });
        } catch (readError) {
          console.error('Error reading converted file:', readError);
          throw new Error('변환된 파일 읽기 실패');
        }

        // 임시 파일 정리
        try {
          await Promise.all([
            fs.unlink(tempInputPath).catch(e => console.warn('Failed to delete input temp file:', e)),
            fs.unlink(actualOutputPath).catch(e => console.warn('Failed to delete output temp file:', e))
          ]);
          console.log('Temp files cleaned up');
        } catch (cleanupError) {
          console.warn('Error during cleanup:', cleanupError);
        }

        const filename = this.generateFileName(file.originalname, 'm4a');
        return {
          buffer: convertedBuffer,
          filename,
          duration: Math.round(duration),
        };
      } catch (conversionError) {
        console.error('Error converting audio:', conversionError);
        throw new Error('오디오 변환 실패');
      }
    } catch (error) {
      console.error('Audio processing error:', error);
      throw new BadRequestException(error instanceof Error ? error.message : '오디오 파일 처리 중 오류가 발생했습니다');
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: 'images' | 'audio' | 'avatars',
  ): Promise<{ url: string; duration?: number }> {
    if (!this.isProduction) {
      throw new Error('S3 업로드는 프로덕션 환경에서만 사용 가능합니다.');
    }

    try {
      let processedResult: { buffer: Buffer; filename: string; duration?: number };

      // 파일 타입에 따른 처리
      if (folder === 'audio') {
        processedResult = await this.processAudio(file);
      } else if (folder === 'images' || folder === 'avatars') {
        processedResult = await this.processImage(file);
      } else {
        processedResult = {
          buffer: file.buffer,
          filename: this.generateFileName(file.originalname),
        };
      }

      const key = `${folder}/${processedResult.filename}`;
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: processedResult.buffer,
        ContentType: folder === 'audio' ? 'audio/mp4' : 'image/webp',
      });

      await this.s3Client.send(command);

      return {
        url: `https://${process.env.AWS_CLOUD_FRONT_DOMAIN}/${key}`,
        ...(processedResult.duration && { duration: processedResult.duration }),
      };
    } catch (error) {
      console.error('File processing/upload error:', error);
      throw new BadRequestException('파일 처리 중 오류가 발생했습니다.');
    }
  }
} 