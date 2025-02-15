import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationType } from '@prisma/client';
import { NotificationGateway } from './notification.gateway';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private notificationQueue: CreateNotificationDto[] = [];
  private readonly BATCH_SIZE = 100;
  private readonly BATCH_INTERVAL = 5000; // 5초

  constructor(
    private prisma: PrismaService,
    private notificationGateway: NotificationGateway,
  ) {
    // 주기적으로 큐에 쌓인 알림들을 배치 처리
    setInterval(() => this.processBatch(), this.BATCH_INTERVAL);
  }

  // 배치 처리 메서드
  private async processBatch() {
    if (this.notificationQueue.length === 0) return;

    const batch = this.notificationQueue.splice(0, this.BATCH_SIZE);

    try {
      // 각 알림별로 설정 체크 후 필터링
      const validNotifications = await Promise.all(
        batch.map(async (notification) => {
          const shouldSend = await this.shouldSendNotification(
            notification.userId,
            notification.type,
          );
          return shouldSend ? notification : null;
        }),
      );

      const filteredBatch = validNotifications.filter(
        (notification): notification is CreateNotificationDto =>
          notification !== null,
      );

      if (filteredBatch.length === 0) return;

      const createdNotifications = await this.prisma.notification.createMany({
        data: filteredBatch.map(({ parentContent, ...notification }) => {
          const transformed = {
            ...notification,
            ...(parentContent && { parentContent: parentContent as any }),
          };
          return transformed;
        }),
        skipDuplicates: true,
      });

      // 실시간 알림 발송
      for (const notification of filteredBatch) {
        this.notificationGateway.sendNotificationToUser(
          notification.userId,
          notification,
        );
      }

      return createdNotifications;
    } catch (error) {
      this.logger.error(
        `Failed to process notification batch: ${error.message}`,
        error.stack,
      );
      // 에러 발생 시 필터링되지 않은 원본 배치를 다시 큐에 추가
      this.notificationQueue.unshift(...batch);
    }
  }

  // 큐에 알림 추가
  async createNotificationAsync(createNotificationDto: CreateNotificationDto) {
    // 알림 수신자와 액션 수행자가 동일한 경우 알림 생성하지 않음
    if (createNotificationDto.userId === createNotificationDto.actorId) {
      return;
    }

    this.notificationQueue.push(createNotificationDto);

    // 큐가 BATCH_SIZE를 초과하면 즉시 처리
    if (this.notificationQueue.length >= this.BATCH_SIZE) {
      await this.processBatch();
    }
  }

  // 즉시 알림 생성이 필요한 경우를 위한 메서드
  async create(createNotificationDto: CreateNotificationDto) {
    const { parentContent, ...notificationData } = createNotificationDto;

    try {
      return await this.prisma.notification.create({
        data: {
          ...notificationData,
          ...(parentContent && { parentContent: parentContent as any }),
        },
        select: {
          id: true,
          type: true,
          content: true,
          isRead: true,
          createdAt: true,
          targetId: true,
          targetType: true,
          parentContent: true,
          actor: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to create notification: ${error.message}`,
        error.stack,
      );
      return null;
    }
  }

  async findAll(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        select: {
          id: true,
          type: true,
          content: true,
          isRead: true,
          createdAt: true,
          userId: true,
          actorId: true,
          targetId: true,
          targetType: true,
          parentContent: true,
          actor: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.notification.count({
        where: { userId },
      }),
    ]);

    return {
      notifications,
      hasMore: skip + limit < total,
      total,
    };
  }

  async markAsRead(id: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!notification || notification.userId !== userId) {
      throw new NotFoundException('알림을 찾을 수 없습니다.');
    }

    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
  }

  async remove(id: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!notification || notification.userId !== userId) {
      throw new NotFoundException('알림을 찾을 수 없습니다.');
    }

    return this.prisma.notification.delete({
      where: { id },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });
  }

  async removeAll(userId: string) {
    try {
      return await this.prisma.notification.deleteMany({
        where: {
          userId,
          isRead: true,
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to delete all notifications for user ${userId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  private async shouldSendNotification(
    userId: string,
    type: NotificationType,
  ): Promise<boolean> {
    const settings = await this.prisma.notificationSetting.findUnique({
      where: { userId },
    });

    if (!settings) return true;
    if (!settings.all) return false;

    const settingMap = {
      NEW_ALBUM: 'newAlbum',
      NEW_PLAYLIST: 'newPlaylist',
      COMMENT: 'comment',
      REPLY: 'reply',
      LIKE: 'like',
      FOLLOW: 'follow',
      MENTION: 'mention',
      ALBUM_TAGGED: 'album_tagged',
      PLAYLIST_TAGGED: 'playlist_tagged',
    } as const;

    if (!(type in settingMap)) return false;

    const settingKey = settingMap[type as keyof typeof settingMap];
    if (!(settingKey in settings)) return true;

    return settings[settingKey] as boolean;
  }
}
