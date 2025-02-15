import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async ping(): Promise<string> {
    return this.redis.ping();
  }

  async getPreviousRank(trackId: string): Promise<number | null> {
    const rank = await this.redis.hget('track_ranks', trackId);
    return rank ? parseInt(rank, 10) : null;
  }

  async setPreviousRank(trackId: string, rank: number): Promise<void> {
    await this.redis.hset('track_ranks', trackId, rank.toString());
  }

  async setMultipleRanks(ranks: Map<string, number>): Promise<void> {
    const pipeline = this.redis.pipeline();
    ranks.forEach((rank, trackId) => {
      pipeline.hset('track_ranks', trackId, rank.toString());
    });
    await pipeline.exec();
  }

  async incrementTrackPlay(trackId: string) {
    const today = new Date().toISOString().split('T')[0];
    const key = `track:${trackId}:plays:${today}`;
    
    try {
      // 1. 오늘의 재생 횟수 증가
      await this.redis.incr(key);
      
      // 2. 24시간 후 만료되도록 설정 (없는 경우에만)
      await this.redis.expire(key, 24 * 60 * 60);
      
      // 3. 전체 재생 횟수 증가
      await this.redis.zincrby('track:plays', 1, trackId);
      
      // 4. 실시간 차트용 재생 횟수 증가 (6시간 window)
      const realtimeKey = `track:plays:realtime`;
      await this.redis.zincrby(realtimeKey, 1, trackId);
      
      // 실시간 차트 데이터는 6시간만 유지
      await this.redis.expire(realtimeKey, 6 * 60 * 60);
    } catch (error) {
      console.error('Redis 오류:', error);
    }
  }
} 