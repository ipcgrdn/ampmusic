import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class LikeService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) {}

  private async createLikeNotification(
    userId: string,
    actorId: string,
    targetId: string,
    targetType: string,
    content: string,
    parentContent?: { id: string; type: string },
  ) {
    if (userId === actorId) return;

    await this.notificationService.createNotificationAsync({
      type: NotificationType.LIKE,
      content,
      userId,
      actorId,
      targetId,
      targetType,
      parentContent,
    });
  }

  async toggleLike(userId: string, itemId: string, itemType: string) {
    return this.prisma.$transaction(async (tx) => {
      const existingLike = await tx.like.findUnique({
        where: {
          userId_itemId_itemType: {
            userId,
            itemId,
            itemType,
          },
        },
      });

      if (existingLike) {
        await tx.like.delete({
          where: { id: existingLike.id },
        });
        return false;
      }

      // 좋아요 생성 시 관계 필드도 함께 설정
      const data: any = {
        userId,
        itemId,
        itemType,
      };

      // itemType에 따라 관계 필드 추가
      switch (itemType) {
        case 'album':
          data.albumId = itemId;
          break;
        case 'track':
          data.trackId = itemId;
          break;
        case 'playlist':
          data.playlistId = itemId;
          break;
      }

      const newLike = await tx.like.create({ data });

      // 알림 생성 로직은 유지
      switch (itemType) {
        case 'album': {
          const album = await tx.album.findUnique({
            where: { id: itemId },
            select: { title: true, artistId: true },
          });
          if (album) {
            await this.createLikeNotification(
              album.artistId,
              userId,
              itemId,
              'Album',
              `앨범 "${album.title}"`,
            );
          }
          break;
        }
        case 'track': {
          const track = await tx.track.findUnique({
            where: { id: itemId },
            select: { 
              title: true, 
              artistId: true,
              albumId: true,
            },
          });
          if (track) {
            await this.createLikeNotification(
              track.artistId,
              userId,
              itemId,
              'TRACK',
              `트랙 "${track.title}"`,
              {
                id: track.albumId,
                type: 'ALBUM',
              }
            );
          }
          break;
        }
        case 'playlist': {
          const playlist = await tx.playlist.findUnique({
            where: { id: itemId },
            select: { title: true, userId: true },
          });
          if (playlist) {
            await this.createLikeNotification(
              playlist.userId,
              userId,
              itemId,
              'Playlist',
              `플레이리스트 "${playlist.title}"`,
            );
          }
          break;
        }
      }

      return true;
    });
  }

  async getLikeStatus(userId: string, itemId: string, itemType: string) {
    const like = await this.prisma.like.findFirst({
      where: { userId, itemId, itemType },
    });
    return !!like;
  }

  async getLikeCount(itemId: string, itemType: string) {
    return await this.prisma.like.count({
      where: { itemId, itemType },
    });
  }

  async getUserLikes(userId: string, type?: 'album' | 'track' | 'playlist') {
    const likes = await this.prisma.like.findMany({
      where: {
        userId,
        ...(type && { itemType: type })
      },
      select: {
        itemId: true,
        itemType: true,
      }
    });

    const [tracks, albums, playlists] = await Promise.all([
      this.prisma.track.findMany({
        where: {
          id: {
            in: likes.filter(like => like.itemType === 'track').map(like => like.itemId)
          }
        },
        include: {
          album: true,
          artist: true,
        }
      }),
      this.prisma.album.findMany({
        where: {
          id: {
            in: likes.filter(like => like.itemType === 'album').map(like => like.itemId)
          }
        },
        include: {
          artist: true,
        }
      }),
      this.prisma.playlist.findMany({
        where: {
          id: {
            in: likes.filter(like => like.itemType === 'playlist').map(like => like.itemId)
          }
        },
        include: {
          user: true,
          tracks: {
            include: {
              track: true,
            }
          }
        }
      })
    ]);

    return { tracks, albums, playlists };
  }
} 