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
  BadRequestException,
  UploadedFile,
  UseInterceptors,
  Patch
} from '@nestjs/common';
import { PlaylistService } from './playlist.service';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { AddTrackDto } from './dto/add-track.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage, memoryStorage } from 'multer';
import { extname } from 'path';
import { User } from '@prisma/client';
import { S3Service, FILE_VALIDATION_RULES } from '../utils/s3-upload.util';

@Controller('playlists')
@UseGuards(JwtGuard)
export class PlaylistController {
  private readonly s3Service: S3Service;
  private readonly isProduction: boolean;

  constructor(private readonly playlistService: PlaylistService) {
    this.s3Service = new S3Service();
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  @Get('popular')
  getPopularPlaylists() {
    return this.playlistService.getPopularPlaylists();
  }

  @Post()
  create(
    @GetUser('id') userId: string,
    @Body() createPlaylistDto: CreatePlaylistDto
  ) {
    return this.playlistService.create(userId, createPlaylistDto);
  }

  @Get()
  findAll() {
    return this.playlistService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.playlistService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePlaylistDto: UpdatePlaylistDto,
    @GetUser() user: User,
  ) {
    try {
      const playlist = await this.playlistService.findOne(id);
      
      if (playlist.userId !== user.id) {
        throw new UnauthorizedException('플레이리스트를 수정할 권한이 없습니다.');
      }

      if (updatePlaylistDto.coverImage && !updatePlaylistDto.coverImage.startsWith('/uploads/')) {
        throw new BadRequestException('올바른 이미지 경로가 아닙니다');
      }

      const updatedPlaylist = await this.playlistService.update(id, user.id, updatePlaylistDto);
      return updatedPlaylist;
    } catch (error) {
      throw error;
    }
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @GetUser('id') userId: string
  ) {
    const playlist = await this.playlistService.findOne(id);
    if (playlist.userId !== userId) {
      throw new UnauthorizedException('Cannot delete other user\'s playlist');
    }
    return this.playlistService.remove(id);
  }

  @Post(':id/tracks')
  async addTrack(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @Body() addTrackDto: AddTrackDto
  ) {
    const playlist = await this.playlistService.findOne(id);
    if (playlist.userId !== userId) {
      throw new UnauthorizedException('Cannot modify other user\'s playlist');
    }
    return this.playlistService.addTrack(id, addTrackDto.trackId);
  }

  @Delete(':id/tracks/:trackId')
  async removeTrack(
    @Param('id') id: string,
    @Param('trackId') trackId: string,
    @GetUser('id') userId: string
  ) {
    const playlist = await this.playlistService.findOne(id);
    if (playlist.userId !== userId) {
      throw new UnauthorizedException('Cannot modify other user\'s playlist');
    }
    return this.playlistService.removeTrack(id, trackId);
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
      limits: {
        fileSize: FILE_VALIDATION_RULES.image.maxSize,
      },
      fileFilter: (_, file, cb) => {
        if (!FILE_VALIDATION_RULES.image.allowedMimeTypes.includes(file.mimetype as 'image/jpeg' | 'image/png' | 'image/jpg' | 'image/webp')) {
          return cb(new BadRequestException('지원하지 않는 이미지 형식입니다'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('파일이 없습니다.');
    }

    if (this.isProduction) {
      return this.s3Service.uploadFile(file, 'images');
    }
    return this.playlistService.uploadImage(file);
  }

  @Get('user/:userId')
  async findByUser(@Param('userId') userId: string) {
    return this.playlistService.findByUser(userId);
  }

  @Put(':id/tracks/reorder')
  async reorderTracks(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @Body() data: { tracks: { id: string; position: number }[] }
  ) {
    const playlist = await this.playlistService.findOne(id);
    
    if (playlist.userId !== userId) {
      throw new UnauthorizedException('Cannot reorder tracks in this playlist');
    }

    return this.playlistService.reorderTracks(id, data.tracks);
  }
} 