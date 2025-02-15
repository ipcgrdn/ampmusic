import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginatedFollowers } from './types';
import { NotificationService } from '../notification/notification.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class FollowService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) {}

  async toggleFollow(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new BadRequestException('자기 자신을 팔로우할 수 없습니다.');
    }

    const targetUser = await this.prisma.user.findUnique({
      where: { id: followingId },
    });

    if (!targetUser) {
      throw new NotFoundException('존재하지 않는 사용자입니다.');
    }

    const existingFollow = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    if (existingFollow) {
      await this.prisma.follow.delete({
        where: { id: existingFollow.id },
      });
      return false;
    }

    await this.prisma.follow.create({
      data: {
        followerId,
        followingId,
      },
    });

    await this.notificationService.createNotificationAsync({
      type: NotificationType.FOLLOW,
      content: '회원님을 팔로우하기 시작했습니다.',
      userId: followingId,
      actorId: followerId,
      targetId: followerId,
      targetType: 'User',
    });

    return true;
  }

  async getFollowStatus(followerId: string, followingId: string) {
    const follow = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });
    return { isFollowing: !!follow };
  }

  async getFollowCounts(userId: string) {
    const [followers, following] = await Promise.all([
      this.prisma.follow.count({
        where: { followingId: userId },
      }),
      this.prisma.follow.count({
        where: { followerId: userId },
      }),
    ]);

    return { followers, following };
  }

  async getFollowers(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedFollowers> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('사용자를 찾을 수 없습니다.');
      }

      const [followers, total] = await Promise.all([
        this.prisma.follow.findMany({
          where: { followingId: userId },
          select: {
            follower: {
              select: {
                id: true,
                name: true,
                avatar: true,
                bio: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
        this.prisma.follow.count({
          where: { followingId: userId },
        }),
      ]).catch(() => {
        throw new InternalServerErrorException('팔로워 목록을 불러오는데 실패했습니다.');
      });

      return {
        followers: followers.map(follow => follow.follower),
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof InternalServerErrorException) {
        throw error;
      }
      throw new InternalServerErrorException('예기치 않은 오류가 발생했습니다.');
    }
  }
} 