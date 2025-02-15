import { Controller, Post, Get, Param, UseGuards, Query } from '@nestjs/common';
import { FollowService } from './follow.service';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { PaginatedFollowers } from './types';

@Controller('follows')
@UseGuards(JwtGuard)
export class FollowController {
  constructor(private followService: FollowService) {}

  @Post(':id')
  async toggleFollow(
    @GetUser('id') userId: string,
    @Param('id') followingId: string,
  ) {
    return this.followService.toggleFollow(userId, followingId);
  }

  @Get(':id')
  async getFollowStatus(
    @GetUser('id') userId: string,
    @Param('id') followingId: string,
  ) {
    return this.followService.getFollowStatus(userId, followingId);
  }

  @Get(':id/counts')
  async getFollowCounts(@Param('id') userId: string) {
    return this.followService.getFollowCounts(userId);
  }

  @Get(':id/followers')
  async getFollowers(
    @Param('id') userId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ): Promise<PaginatedFollowers> {
    return this.followService.getFollowers(
      userId,
      parseInt(page),
      parseInt(limit)
    );
  }
} 