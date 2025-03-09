import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAlbumDto } from './dto/create-album.dto';
import sharp from 'sharp';
import { getAudioDurationInSeconds } from 'get-audio-duration';
import * as fs from 'fs/promises';
import { SearchService } from '../search/search.service';
import { NotificationService } from '../notification/notification.service';
import { NotificationType } from '@prisma/client';
import { CreateNotificationDto } from '../notification/dto/create-notification.dto';
import { AudioConverter } from '../utils/audio-converter';
import { join } from 'path';
import { unlink } from 'fs/promises';
import { extname } from 'path';

@Injectable()
export class AlbumService {
  constructor(
    private prisma: PrismaService,
    private searchService: SearchService,
    private notificationService: NotificationService,
  ) {}

  async create(userId: string, createAlbumDto: CreateAlbumDto) {
    const { tracks, artistId, taggedUserIds, ...albumData } = createAlbumDto;

    const releaseDate = new Date(
      `${albumData.releaseDate}T00:00:00+09:00`,
    ).toISOString();

    const album = await this.prisma.album.create({
      data: {
        ...albumData,
        releaseDate,
        artist: {
          connect: { id: userId },
        },
        tracks: {
          create: tracks.map((track) => ({
            ...track,
            description: track.description || null,
            lyrics: track.lyrics || null,
            credit: track.credit || null,
            artist: {
              connect: { id: userId },
            },
          })),
        },
        ...(taggedUserIds && {
          taggedUsers: {
            create: taggedUserIds.map((userId) => ({
              user: { connect: { id: userId } },
            })),
          },
        }),
      },
      include: {
        tracks: true,
        artist: true,
        taggedUsers: {
          include: {
            user: true,
          },
        },
      },
    });

    await this.searchService.indexDocument('album', album);

    // 앨범의 트랙들도 인덱싱
    for (const track of album.tracks) {
      await this.searchService.indexDocument('track', track);
    }

    // 팔로워들에게 알림 전송
    const followers = await this.prisma.follow.findMany({
      where: { followingId: userId },
      select: { followerId: true },
    });

    // 배치 처리를 위한 알림 데이터 생성
    const notifications = followers.map((follower) => ({
      type: 'NEW_ALBUM' as NotificationType,
      content: `${album.artist.name}님이 새 앨범 "${album.title}"을(를) 발매했습니다.`,
      userId: follower.followerId,
      actorId: userId,
      targetId: album.id,
      targetType: 'Album',
    }));

    // 태그된 사용자들에 대한 알림 추가
    if (taggedUserIds?.length) {
      const taggedNotifications: CreateNotificationDto[] = taggedUserIds.map(
        (taggedUserId) => ({
          type: 'ALBUM_TAGGED' as NotificationType,
          content: `님이 앨범 "${album.title}"에 회원님을 태그했습니다.`,
          userId: taggedUserId,
          actorId: userId,
          targetId: album.id,
          targetType: 'Album',
        }),
      );
      notifications.push(...taggedNotifications);
    }

    // 모든 알림을 배치로 생성
    for (const notification of notifications) {
      await this.notificationService.createNotificationAsync(notification);
    }

    return album;
  }

  async findAll() {
    return this.prisma.album.findMany({
      include: {
        artist: true,
        tracks: {
          select: {
            id: true,
            title: true,
            duration: true,
            audioUrl: true,
            order: true,
            description: true,
            lyrics: true,
            credit: true,
            plays: true,
            album: true,
            artist: true,
          },
        },
        taggedUsers: {
          include: {
            user: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const album = await this.prisma.album.findUnique({
      where: { id },
      include: {
        artist: true,
        tracks: {
          select: {
            id: true,
            title: true,
            duration: true,
            audioUrl: true,
            order: true,
            description: true,
            lyrics: true,
            credit: true,
            plays: true,
            album: true,
            artist: true,
          },
        },
        taggedUsers: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!album) {
      throw new NotFoundException('Album not found');
    }

    return album;
  }

  async update(
    id: string,
    userId: string,
    updateAlbumDto: Partial<CreateAlbumDto>,
  ) {
    const album = await this.prisma.album.findUnique({
      where: { id },
      include: { artist: true, tracks: true },
    });

    if (!album) {
      throw new NotFoundException('Album not found');
    }

    if (album.artistId !== userId) {
      throw new UnauthorizedException("Cannot update other user's album");
    }

    const { tracks, artistId, taggedUserIds, ...albumData } = updateAlbumDto;

    // 트랜잭션으로 처리
    const updatedAlbum = await this.prisma.$transaction(async (prisma) => {
      // 1. 앨범 기본 정보 업데이트
      const updated = await prisma.album.update({
        where: { id },
        data: {
          ...albumData,
          ...(taggedUserIds && {
            taggedUsers: {
              deleteMany: {},
              create: taggedUserIds.map((taggedUserId) => ({
                user: { connect: { id: taggedUserId } },
              })),
            },
          }),
        },
        include: {
          tracks: true,
          artist: true,
          taggedUsers: {
            include: {
              user: true,
            },
          },
        },
      });

      // 2. 트랙 업데이트 (있는 경우)
      if (tracks) {
        // 기존 트랙 ID 목록
        const existingTrackIds = album.tracks.map(track => track.id);
        
        // 새로운 트랙 생성
        for (const track of tracks) {
          if (track.id && existingTrackIds.includes(track.id)) {
            // 기존 트랙 업데이트
            await prisma.track.update({
              where: { id: track.id },
              data: {
                ...track,
                order: track.order,
              },
            });
          } else {
            // 새로운 트랙 추가
            await prisma.track.create({
              data: {
                ...track,
                album: { connect: { id } },
                artist: { connect: { id: userId } },
              },
            });
          }
        }

        // 삭제된 트랙 처리
        const updatedTrackIds = tracks.map(track => track.id).filter(Boolean);
        await prisma.track.deleteMany({
          where: {
            id: {
              in: existingTrackIds.filter(id => !updatedTrackIds.includes(id)),
            },
          },
        });
      }

      return updated;
    });

    await this.searchService.indexDocument('album', updatedAlbum);

    // 업데이트된 트랙들도 인덱싱
    for (const track of updatedAlbum.tracks) {
      await this.searchService.indexDocument('track', track);
    }

    // 새로 태그된 사용자들에게 알림 발송
    if (taggedUserIds?.length) {
      const notifications: CreateNotificationDto[] = taggedUserIds.map(
        (taggedUserId) => ({
          type: NotificationType.ALBUM_TAGGED,
          content: `${updatedAlbum.artist.name}님이 앨범 "${updatedAlbum.title}"에 회원님을 태그했습니다.`,
          userId: taggedUserId,
          actorId: userId,
          targetId: updatedAlbum.id,
          targetType: 'Album',
        }),
      );

      for (const notification of notifications) {
        await this.notificationService.createNotificationAsync(notification);
      }
    }

    return updatedAlbum;
  }

  async remove(id: string, userId: string) {
    const album = await this.prisma.album.findUnique({
      where: { id },
      include: { artist: true, tracks: true, taggedUsers: true },
    });

    if (!album) {
      throw new NotFoundException('Album not found');
    }

    if (album.artistId !== userId) {
      throw new UnauthorizedException("Cannot delete other user's album");
    }

    // 트랜잭션으로 처리
    return this.prisma.$transaction(async (prisma) => {
      // 1. 트랙 활동 로그 삭제
      await prisma.trackActivityLog.deleteMany({
        where: {
          trackId: {
            in: album.tracks.map(track => track.id),
          },
        },
      });

      // 2. 앨범 삭제 (트랙은 cascade로 자동 삭제)
      return prisma.album.delete({
        where: { id },
      });
    });
  }

  async uploadImage(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('파일이 없습니다');
    }

    // 이미지 최적화 처리
    const optimized = await sharp(file.path)
      .resize(800, 800, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: 80 })
      .toBuffer();

    await fs.writeFile(file.path, optimized);

    return {
      url: `/uploads/images/${file.filename}`,
    };
  }

  async uploadAudio(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('파일이 없습니다');
    }

    try {
      // AAC 변환
      const outputDir = join(process.cwd(), 'uploads', 'audio');
      const convertedFileName = await AudioConverter.convertToAAC(
        file.path,
        outputDir,
      );

      // 원본 파일 삭제
      try {
        await unlink(file.path);
      } catch (unlinkError) {
        console.error('원본 파일 삭제 실패:', unlinkError);
      }

      // 메타데이터 추출
      const duration = await getAudioDurationInSeconds(
        join(outputDir, convertedFileName),
      );

      const result = {
        url: `/uploads/audio/${convertedFileName}`,
        duration: Math.round(duration),
      };

      return result;
    } catch (error) {
      console.error('Audio processing error:', {
        error,
        file: file.path,
        message: error.message,
      });
      throw new BadRequestException('오디오 파일 처리 중 오류가 발생했습니다');
    }
  }

  async findByUser(userId: string) {
    return this.prisma.album.findMany({
      where: { artistId: userId },
      include: {
        tracks: true,
        artist: true,
        taggedUsers: {
          include: {
            user: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findTracksByUser(userId: string) {
    const tracks = await this.prisma.track.findMany({
      where: { artistId: userId },
      include: {
        album: true,
        artist: true,
      },
      orderBy: [{ albumId: 'asc' }, { order: 'asc' }],
    });

    return tracks;
  }

  async getNewReleases() {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const releases = await this.prisma.album.findMany({
        where: {
          releaseDate: {
            gte: sevenDaysAgo,
          },
        },
        take: 50,
        orderBy: {
          releaseDate: 'desc',
        },
        include: {
          artist: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return releases;
    } catch (error) {
      console.error('[AlbumService] Error in getNewReleases:', {
        message: error.message,
        code: error.code,
        stack: error.stack,
      });
      throw error;
    }
  }

  async getAudioDuration(file: Express.Multer.File): Promise<number> {
    try {
      if (file.buffer) {
        // 프로덕션 환경 (메모리에 있는 파일)
        const tempPath = join(process.cwd(), 'temp', file.filename);
        await fs.mkdir(join(process.cwd(), 'temp'), { recursive: true });
        await fs.writeFile(tempPath, file.buffer);
        const duration = await getAudioDurationInSeconds(tempPath);
        await fs.unlink(tempPath);
        return Math.round(duration);
      } else {
        // 개발 환경 (디스크에 있는 파일)
        const duration = await getAudioDurationInSeconds(file.path);
        return Math.round(duration);
      }
    } catch (error) {
      console.error('Error getting audio duration:', error);
      throw new BadRequestException('오디오 파일 처리 중 오류가 발생했습니다');
    }
  }
}
