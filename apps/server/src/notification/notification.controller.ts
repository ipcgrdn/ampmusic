import { 
  Controller, 
  Get, 
  Patch, 
  Delete, 
  Param, 
  Query, 
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('notifications')
@UseGuards(JwtGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async findAll(
    @GetUser('id') userId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.notificationService.findAll(userId, page, limit);
  }

  @Get('unread/count')
  async getUnreadCount(@GetUser('id') userId: string) {
    const count = await this.notificationService.getUnreadCount(userId);
    return { count };
  }

  @Delete('delete-all')
  async removeAll(@GetUser('id') userId: string) {
    try {
      return await this.notificationService.removeAll(userId);
    } catch (error) {
      throw error;
    }
  }

  @Patch(':id/read')
  async markAsRead(
    @Param('id') id: string,
    @GetUser('id') userId: string,
  ) {
    try {
      return await this.notificationService.markAsRead(id, userId);
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('알림을 찾을 수 없습니다.');
      }
      throw error;
    }
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @GetUser('id') userId: string,
  ) {
    try {
      return await this.notificationService.remove(id, userId);
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('알림을 찾을 수 없습니다.');
      }
      throw error;
    }
  }

  @Patch('read-all')
  async markAllAsRead(@GetUser('id') userId: string) {
    try {
      return await this.notificationService.markAllAsRead(userId);
    } catch (error) {
      throw error;
    }
  }
}
