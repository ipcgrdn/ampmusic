import ffmpeg from 'fluent-ffmpeg';
import { path as ffmpegPath } from '@ffmpeg-installer/ffmpeg';
import { join } from 'path';
import { randomUUID } from 'crypto';

ffmpeg.setFfmpegPath(ffmpegPath);

export class AudioConverter {
  static async convertAudio(inputPath: string, outputDir: string): Promise<string> {
    const baseFileName = randomUUID();
    
    try {
      // AAC 변환
      await this.convertToAAC(inputPath, outputDir);
      // FLAC 변환
      await this.convertToFLAC(inputPath, outputDir, baseFileName);
      
      return baseFileName;  // 확장자 없는 base filename 반환
    } catch (error) {
      throw new Error(`Audio conversion failed: ${error.message}`);
    }
  }

  static async convertToAAC(inputPath: string, outputDir: string): Promise<string> {
    const outputFileName = `${randomUUID()}.m4a`;
    const outputPath = join(outputDir, outputFileName);

    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .inputOptions(['-vn'])
        .audioCodec('aac')
        .audioBitrate('320k')      // 320kbps 고음질
        .audioChannels(2)          // 스테레오
        .audioFrequency(48000)     // 48kHz
        .toFormat('ipod')          // AAC 컨테이너
        .outputOptions([
          '-strict experimental',
          '-movflags +faststart',  // 스트리밍 최적화
        ])
        .on('end', () => resolve(outputFileName))
        .on('error', (err) => reject(err))
        .save(outputPath);
    });
  }

  static async convertToALAC(inputPath: string, outputDir: string): Promise<string> {
    const outputFileName = `${randomUUID()}.m4a`;
    const outputPath = join(outputDir, outputFileName);

    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .inputOptions(['-vn'])
        .audioCodec('alac')
        .audioFrequency(192000)
        .audioBitrate('9216k')
        .audioChannels(2)
        .outputOptions([
          '-bits_per_raw_sample 24'
        ])
        .on('end', () => resolve(outputFileName))
        .on('error', (err) => reject(err))
        .save(outputPath);
    });
  }

  private static async convertToFLAC(inputPath: string, outputDir: string, baseFileName: string): Promise<void> {
    const outputPath = join(outputDir, `${baseFileName}.flac`);

    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .toFormat('flac')
        .audioCodec('flac')
        .on('end', () => resolve())
        .on('error', (err) => reject(err))
        .save(outputPath);
    });
  }

  static async getAudioDuration(filePath: string): Promise<number> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) {
          console.error('Duration 추출 오류:', err);
          return reject(err);
        }
        
        const duration = metadata.format.duration || 0;
        console.log('Duration 추출 완료:', duration);
        resolve(duration);
      });
    });
  }

  static async getAudioMetadata(filePath: string): Promise<{
    format: string;
    bitrate: number;
  }> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) return reject(err);
        
        const audioStream = metadata.streams.find(s => s.codec_type === 'audio');
        resolve({
          format: audioStream?.codec_name || '',
          bitrate: Math.round((audioStream?.bit_rate || 0) / 1000), // kbps로 변환
        });
      });
    });
  }
}