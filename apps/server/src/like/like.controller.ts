import { Controller, Post, Get, Param, UseGuards, Query } from '@nestjs/common';
import { LikeService } from './like.service';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '@prisma/client';

@Controller('likes')
@UseGuards(JwtGuard)
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @Post(':type/:id')
  async toggleLike(
    @Param('type') type: string,
    @Param('id') id: string,
    @GetUser() user: User
  ) {
    const isLiked = await this.likeService.toggleLike(user.id, id, type);
    return { isLiked };
  }

  @Get(':type/:id')
  async getLikeStatus(
    @Param('type') type: string,
    @Param('id') id: string,
    @GetUser() user: User
  ) {
    return {
      isLiked: await this.likeService.getLikeStatus(user.id, id, type)
    };
  }

  @Get('count/:type/:id')
  async getLikeCount(
    @Param('type') type: string,
    @Param('id') id: string
  ) {
    return {
      count: await this.likeService.getLikeCount(id, type)
    };
  }

  @Get('/users/:userId/likes')
  async getUserLikes(
    @Param('userId') userId: string,
    @Query('type') type?: 'album' | 'track' | 'playlist'
  ) {
    return this.likeService.getUserLikes(userId, type);
  }
} 