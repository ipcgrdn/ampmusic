import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { AlbumModule } from './album/album.module';
import { PlaylistModule } from './playlist/playlist.module';
import { TrackModule } from './track/track.module';
import { SearchModule } from './search/search.module';
import { LikeModule } from './like/like.module';
import { FollowModule } from './follow/follow.module';
import { CommentModule } from './comment/comment.module';
import { NotificationModule } from './notification/notification.module';
import { RedisModule } from './redis/redis.module';
import { InquiryModule } from './inquiry/inquiry.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'production' 
        ? '.env.production'
        : '.env',
    }),
    ThrottlerModule.forRoot([{
      ttl: 60,
      limit: 100,
    }]),
    PrismaModule,
    AuthModule,
    UserModule,
    AlbumModule,
    PlaylistModule,
    TrackModule,
    
    SearchModule,
    LikeModule,
    FollowModule,
    CommentModule,
    NotificationModule,
    
    RedisModule,
    InquiryModule,
    HealthModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
