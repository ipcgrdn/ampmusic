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
import { diskStorage } from 'multer';
import { extname } from 'path';
import { User } from '@prisma/client';

@Controller('playlists')
@UseGuards(JwtGuard)
export class PlaylistController {
  constructor(private readonly playlistService: PlaylistService) {}

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
      storage: diskStorage({
        destination: './uploads/images',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return cb(new BadRequestException('지원하지 않는 이미지 형식입니다'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
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