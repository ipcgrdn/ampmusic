import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  UnauthorizedException,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  InternalServerErrorException,
  Query,
  Patch,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { maxFileSize, imageFileFilter } from './utils/file-upload.utils';
import { optimizeImage } from './utils/image-optimizer';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { deleteOldAvatar } from './utils/file-upload.utils';
import { mkdir } from 'fs/promises';
import { AVATAR_UPLOAD_PATH } from '../constants/paths';
import { User } from '@prisma/client';

@Controller('users')
@UseGuards(JwtGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('featured')
  async getFeaturedArtists() {
    return this.userService.getFeaturedArtists();
  }

  @Get('following/updates')
  @UseGuards(JwtGuard)
  async getFollowingUpdates(@GetUser('id') userId: string) {
    return this.userService.getFollowingUpdates(userId);
  }

  @Get('following/activity')
  async getFollowingActivity(@GetUser('id') userId: string) {
    return this.userService.getFollowingActivity(userId);
  }

  @Get('following/likes')
  async getFollowingLikes(@GetUser('id') userId: string) {
    const activities = await this.userService.getFollowingLikes(userId);

    // 트랙 정보를 포함한 응답 데이터 구성
    const enrichedActivities = await Promise.all(
      activities.map(async (activity) => {
        const track = await this.userService.getTrackWithDetails(
          activity.targetId,
        );

        return {
          id: activity.id,
          type: activity.type,
          createdAt: activity.createdAt,
          user: activity.user,
          track: track
            ? {
                id: track.id,
                title: track.title,
                trackUrl: track.audioUrl,
                duration: track.duration,
                lyrics: track.lyrics,
                description: track.description,
                credit: track.credit,
                album: {
                  id: track.album.id,
                  title: track.album.title,
                  coverImage: track.album.coverImage,
                  artist: {
                    id: track.album.artist.id,
                    name: track.album.artist.name,
                  },
                },
              }
            : null,
        };
      }),
    );

    // null track 필터링 및 중복 제거
    const filteredActivities = enrichedActivities
      .filter((activity) => activity.track)
      .reduce(
        (acc, curr) => {
          const key = `${curr.user.id}-${curr.track.id}`;
          if (
            !acc[key] ||
            new Date(curr.createdAt) > new Date(acc[key].createdAt)
          ) {
            acc[key] = curr;
          }
          return acc;
        },
        {} as Record<string, (typeof enrichedActivities)[0]>,
      );

    return Object.values(filteredActivities);
  }

  @Post('activity')
  async recordActivity(
    @GetUser('id') userId: string,
    @Body() data: { 
      type: string, 
      targetType: string, 
      targetId: string, 
      metadata?: any 
    }
  ) {
    return this.userService.recordActivity(
      userId,
      data.type,
      data.targetType,
      data.targetId,
      data.metadata
    );
  }

  @Get('search')
  async searchUsers(@Query('q') query: string) {
    if (!query) {
      return [];
    }
    const results = await this.userService.searchUsers(query);
    return results;
  }

  @Get(':id')
  async getProfile(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @Get()
  async getArtists() {
    return this.userService.findAll();
  }

  @Put(':id')
  async updateProfile(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    if (id !== userId) {
      throw new UnauthorizedException("Cannot update other user's profile");
    }
    return this.userService.updateUser(id, updateUserDto);
  }

  @Delete(':id')
  async deleteAccount(@Param('id') id: string, @GetUser('id') userId: string) {
    if (id !== userId) {
      throw new UnauthorizedException("Cannot delete other user's account");
    }
    return this.userService.deleteUser(id);
  }

  @Post(':id/avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: maxFileSize,
      },
      fileFilter: imageFileFilter,
    }),
  )
  async updateAvatar(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (id !== userId) {
      throw new BadRequestException("Cannot update other user's avatar");
    }

    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    try {
      const currentUser = await this.userService.findById(id);
      const optimizedImageBuffer = await optimizeImage(file.buffer);

      try {
        await mkdir(AVATAR_UPLOAD_PATH, { recursive: true });
      } catch (err) {
        throw new InternalServerErrorException(
          'Failed to create upload directory',
        );
      }

      const filename = `avatar-${Date.now()}.webp`;
      const filePath = join(AVATAR_UPLOAD_PATH, filename);

      try {
        await writeFile(filePath, optimizedImageBuffer);
      } catch (err) {
        throw new InternalServerErrorException('Failed to save image file');
      }

      const avatarUrl = `${process.env.API_URL}/uploads/avatars/${filename}`;
      const updatedUser = await this.userService.updateUser(id, {
        avatar: avatarUrl,
      });

      await deleteOldAvatar(currentUser.avatar);

      return updatedUser;
    } catch (error) {
      throw new InternalServerErrorException('Failed to process image');
    }
  }

  @Get(':id/notification-settings')
  async getNotificationSettings(@Param('id') id: string) {
    return this.userService.getNotificationSettings(id);
  }

  @Patch(':id/notification-settings')
  async updateNotificationSettings(
    @Param('id') id: string,
    @Body() data: { type: string; enabled: boolean },
    @GetUser() user: User,
  ) {
    if (id !== user.id) {
      throw new UnauthorizedException('자신의 설정만 변경할 수 있습니다.');
    }
    return this.userService.updateNotificationSettings(
      id,
      data.type,
      data.enabled,
    );
  }
}
