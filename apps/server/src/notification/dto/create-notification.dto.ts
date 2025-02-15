import { NotificationType } from '@prisma/client';
import { IsString, IsEnum, IsNotEmpty } from 'class-validator';

export class CreateNotificationDto {
  @IsEnum(NotificationType)
  type: NotificationType

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsNotEmpty()
  userId: string;  // 수신자 ID

  @IsString()
  @IsNotEmpty()
  actorId: string;  // 발신자 ID

  @IsString()
  @IsNotEmpty()
  targetId: string;

  @IsString()
  @IsNotEmpty()
  targetType: string;

  parentContent?: {
    id: string;
    type: string;
  };
} 