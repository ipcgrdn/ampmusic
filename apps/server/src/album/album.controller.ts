import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  UnauthorizedException,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { AlbumService } from './album.service';
import { CreateAlbumDto } from './dto/create-album.dto';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage, memoryStorage } from 'multer';
import { extname } from 'path';
import { S3Service } from '../utils/s3-upload.util';

@Controller('albums')
@UseGuards(JwtGuard)
export class AlbumController {
  private readonly s3Service: S3Service;
  private readonly isProduction: boolean;

  constructor(private readonly albumService: AlbumService) {
    this.s3Service = new S3Service();
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  @Get('new-releases')
  async getNewReleases() {
    try {
      const result = await this.albumService.getNewReleases();

      return result;
    } catch (error) {
      console.error('[AlbumController] Error fetching new releases:', {
        message: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  @Post()
  async create(
    @GetUser('id') userId: string,
    @Body() createAlbumDto: CreateAlbumDto,
  ) {
    if (userId !== createAlbumDto.artistId) {
      throw new UnauthorizedException('Cannot create album for other user');
    }
    return this.albumService.create(userId, createAlbumDto);
  }

  @Get()
  async findAll() {
    return this.albumService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.albumService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @Body() updateAlbumDto: Partial<CreateAlbumDto>,
  ) {
    return this.albumService.update(id, userId, updateAlbumDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.albumService.remove(id, userId);
  }

  @Post('upload/image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: process.env.NODE_ENV === 'production' 
        ? memoryStorage()
        : diskStorage({
            destination: './uploads/images',
            filename: (_, file, cb) => {
              const randomName = Array(32)
                .fill(null)
                .map(() => Math.round(Math.random() * 16).toString(16))
                .join('');
              return cb(null, `${randomName}${extname(file.originalname)}`);
            },
          }),
      fileFilter: (_, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return cb(
            new BadRequestException('지원하지 않는 이미지 형식입니다'),
            false,
          );
        }
        cb(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (this.isProduction) {
      return this.s3Service.uploadFile(file, 'images');
    }
    return this.albumService.uploadImage(file);
  }

  @Post('upload/audio')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: process.env.NODE_ENV === 'production'
        ? memoryStorage()
        : diskStorage({
            destination: './uploads/audio',
            filename: (req, file, cb) => {
              const randomName = Array(32)
                .fill(null)
                .map(() => Math.round(Math.random() * 16).toString(16))
                .join('');
              console.log('Generating filename for:', file.originalname);
              const filename = `${randomName}${extname(file.originalname)}`;
              console.log('Generated filename:', filename);
              return cb(null, filename);
            },
          }),
      fileFilter: (_, file, cb) => {
        console.log('Checking file type:', file.mimetype);
        if (!file.mimetype.match(/^audio\/(mpeg|wav|flac|aac|ogg)$/)) {
          console.log('Invalid file type rejected:', file.mimetype);
          return cb(
            new BadRequestException('지원하지 않는 오디오 형식입니다'),
            false,
          );
        }
        console.log('File type accepted:', file.mimetype);
        cb(null, true);
      },
      limits: {
        fileSize: 20 * 1024 * 1024, // 20MB
      },
    }),
  )
  async uploadAudio(@UploadedFile() file: Express.Multer.File) {
    if (this.isProduction) {
      const result = await this.s3Service.uploadFile(file, 'audio');
      const duration = await this.albumService.getAudioDuration(file);
      return { ...result, duration };
    }
    return this.albumService.uploadAudio(file);
  }

  @Get('user/:userId')
  async findByUser(@Param('userId') userId: string) {
    return this.albumService.findByUser(userId);
  }

  @Get('user/:userId/tracks')
  async findTracksByUser(@Param('userId') userId: string) {
    return this.albumService.findTracksByUser(userId);
  }
}
