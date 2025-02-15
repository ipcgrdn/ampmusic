import { Module, OnModuleInit } from '@nestjs/common';
import { RedisModule as NestRedisModule } from '@nestjs-modules/ioredis';
import { RedisService } from './redis.service';
import { Logger } from '@nestjs/common';

@Module({
  imports: [
    NestRedisModule.forRootAsync({
      useFactory: () => ({
        type: 'single',
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        retryStrategy: (times: number) => {
          const delay = Math.min(times * 50, 2000);
          Logger.warn(`Redis connection attempt ${times}. Retrying in ${delay}ms...`);
          return delay;
        },
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        reconnectOnError: (err) => {
          Logger.error(`Redis connection error: ${err.message}`);
          return true;
        },
      }),
    }),
  ],
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule implements OnModuleInit {
  private readonly logger = new Logger(RedisModule.name);

  constructor(private readonly redisService: RedisService) {}

  async onModuleInit() {
    try {
      await this.redisService.ping();
      this.logger.log('Successfully connected to Redis');
    } catch (error) {
      this.logger.error('Failed to connect to Redis:', error.message);
      // 개발 환경에서는 Redis 연결 실패를 허용
      if (process.env.NODE_ENV === 'production') {
        throw error;
      }
    }
  }
} 