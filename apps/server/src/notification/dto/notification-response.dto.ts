import { NotificationType } from '@prisma/client';

export class NotificationResponseDto {
  id: string;
  type: NotificationType;
  content: string;
  isRead: boolean;
  createdAt: Date;
  actor: {
    id: string;
    name: string;
    avatar: string;
  };
  targetId: string;
  targetType: string;
} 