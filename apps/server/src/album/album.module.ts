import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { AlbumController } from './album.controller';
import { AlbumService } from './album.service';
import { PrismaModule } from '../prisma/prisma.module';
import { SearchModule } from '../search/search.module';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [
    PrismaModule,
    SearchModule,
    MulterModule.register({
      dest: './uploads',
    }),
    NotificationModule,
  ],
  controllers: [AlbumController],
  providers: [AlbumService],
  exports: [AlbumService],
})
export class AlbumModule {}
 