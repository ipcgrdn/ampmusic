import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';
import sharp from 'sharp';
import * as fs from 'fs/promises';
import * as path from 'path';
import { SearchService } from '../search/search.service';
import { NotificationService } from '../notification/notification.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class PlaylistService {
  constructor(
    private prisma: PrismaService,
    private searchService: SearchService,
    private notificationService: NotificationService,
  ) {}

  async create(userId: string, dto: CreatePlaylistDto) {
    const { taggedUserIds, ...playlistData } = dto;

    const playlist = await this.prisma.playlist.create({
      data: {
        ...playlistData,
        userId,
        ...(taggedUserIds && {
          taggedUsers: {
            create: taggedUserIds.map((taggedId) => ({
              user: { connect: { id: taggedId } },
            })),
          },
        }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        tracks: {
          include: {
            track: {
              include: {
                artist: true,
                album: true,
              },
            },
          },
          orderBy: {
            position: 'asc',
          },
        },
        taggedUsers: {
          include: {
            user: true,
          },
        },
      },
    });

    await this.searchService.indexDocument('playlist', playlist);

    // 태그된 사용자들에게 알림 발송
    if (taggedUserIds?.length) {
      for (const taggedId of taggedUserIds) {
        await this.notificationService.createNotificationAsync({
          type: NotificationType.PLAYLIST_TAGGED,
          content: `님이 플레이리스트 "${playlist.title}"에 회원님을 태그했습니다.`,
          userId: taggedId,
          actorId: userId,
          targetId: playlist.id,
          targetType: 'Playlist',
        });
      }
    }

    // 공개 플레이리스트인 경우에만 알림 전송
    if (playlist.isPublic) {
      const followers = await this.prisma.follow.findMany({
        where: { followingId: userId },
        select: { followerId: true },
      });

      const notifications = followers.map((follower) => ({
        type: NotificationType.NEW_PLAYLIST,
        content: `${playlist.user.name}님이 새 플레이리스트 "${playlist.title}"을(를) 만들었습니다.`,
        userId: follower.followerId,
        actorId: userId,
        targetId: playlist.id,
        targetType: 'Playlist',
      }));

      for (const notification of notifications) {
        await this.notificationService.createNotificationAsync(notification);
      }
    }

    return playlist;
  }

  async findAll() {
    return this.prisma.playlist.findMany({
      where: {
        isPublic: true,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        taggedUsers: {
          include: {
            user: true,
          },
        },
        tracks: {
          include: {
            track: true,
          },
          orderBy: {
            position: 'asc',
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const playlist = await this.prisma.playlist.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        taggedUsers: {
          include: {
            user: true,
          },
        },
        tracks: {
          include: {
            track: {
              select: {
                id: true,
                title: true,
                duration: true,
                audioUrl: true,
                description: true,
                lyrics: true,
                credit: true,
                plays: true,
                album: true,
                artist: true,
              },
            },
          },
          orderBy: {
            position: 'asc',
          },
        },
      },
    });

    if (!playlist) {
      throw new NotFoundException('플레이리스트를 찾을 수 없습니다.');
    }

    return playlist;
  }

  async update(
    id: string,
    userId: string,
    updatePlaylistDto: UpdatePlaylistDto,
  ) {
    try {
      const existingPlaylist = await this.prisma.playlist.findUnique({
        where: { id },
        include: { user: true },
      });

      if (!existingPlaylist) {
        throw new NotFoundException('플레이리스트를 찾을 수 없습니다.');
      }

      if (existingPlaylist.userId !== userId) {
        throw new UnauthorizedException(
          '플레이리스트를 수정할 권한이 없습니다.',
        );
      }

      const { taggedUserIds, ...playlistData } = updatePlaylistDto;

      const updatedPlaylist = await this.prisma.playlist.update({
        where: { id },
        data: {
          ...playlistData,
          ...(taggedUserIds && {
            taggedUsers: {
              deleteMany: {},
              create: taggedUserIds.map((taggedId) => ({
                user: { connect: { id: taggedId } },
              })),
            },
          }),
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          tracks: {
            include: {
              track: {
                include: {
                  artist: true,
                  album: true,
                },
              },
            },
            orderBy: {
              position: 'asc',
            },
          },
          taggedUsers: {
            include: {
              user: true,
            },
          },
        },
      });

      await this.searchService.indexDocument('playlist', updatedPlaylist);

      // 태그된 사용자들에게 알림 발송
      if (taggedUserIds?.length) {
        for (const taggedId of taggedUserIds) {
          await this.notificationService.createNotificationAsync({
            type: NotificationType.PLAYLIST_TAGGED,
            content: `${updatedPlaylist.user.name}님이 플레이리스트 "${updatedPlaylist.title}"에 회원님을 태그했습니다.`,
            userId: taggedId,
            actorId: userId,
            targetId: updatedPlaylist.id,
            targetType: 'Playlist',
          });
        }
      }

      return updatedPlaylist;
    } catch (error) {
      throw error;
    }
  }

  async remove(id: string) {
    await this.prisma.playlist.delete({
      where: { id },
    });
    return { success: true };
  }

  async addTrack(playlistId: string, trackId: string) {
    // 중복 체크
    const existingTrack = await this.prisma.playlistTrack.findFirst({
      where: {
        playlistId,
        trackId,
      },
    });

    if (existingTrack) {
      throw new BadRequestException('이미 플레이리스트에 존재하는 트랙입니다.');
    }

    // 현재 플레이리스트의 마지막 position 찾기
    const lastTrack = await this.prisma.playlistTrack.findFirst({
      where: { playlistId },
      orderBy: { position: 'desc' },
    });

    const position = lastTrack ? lastTrack.position + 1 : 1;

    // 새로운 PlaylistTrack 생성
    const newPlaylistTrack = await this.prisma.playlistTrack.create({
      data: {
        playlistId,
        trackId,
        position,
        addedAt: new Date(), // 명시적으로 addedAt 설정
      },
      include: {
        track: {
          include: {
            artist: true,
            album: true,
          },
        },
      },
    });

    return newPlaylistTrack;
  }

  async removeTrack(playlistId: string, trackId: string) {
    // 삭제할 트랙의 position 찾기
    const trackToRemove = await this.prisma.playlistTrack.findFirst({
      where: {
        playlistId,
        trackId,
      },
    });

    if (!trackToRemove) {
      throw new NotFoundException('Track not found in playlist');
    }

    // 트랙 삭제
    await this.prisma.playlistTrack.delete({
      where: {
        id: trackToRemove.id,
      },
    });

    // 삭제된 트랙 이후의 position 재정렬
    await this.prisma.playlistTrack.updateMany({
      where: {
        playlistId,
        position: {
          gt: trackToRemove.position,
        },
      },
      data: {
        position: {
          decrement: 1,
        },
      },
    });

    return { success: true };
  }

  private async validateImage(file: Express.Multer.File) {
    // 파일 크기 검증 (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('이미지 크기는 5MB를 넘을 수 없습니다');
    }

    // 파일 타입 검증
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.mimetype)) {
      throw new BadRequestException('JPG, PNG, WEBP 형식만 지원합니다');
    }

    // 이미지 크기 및 형식 검증
    try {
      const metadata = await sharp(file.buffer || file.path).metadata();

      // 최소/최대 크기 제한
      if (metadata.width < 200 || metadata.height < 200) {
        throw new BadRequestException(
          '이미지는 최소 200x200 픽셀이어야 합니다',
        );
      }
      if (metadata.width > 2000 || metadata.height > 2000) {
        throw new BadRequestException(
          '이미지는 최대 2000x2000 픽셀을 넘을 수 없습니다',
        );
      }
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException('이미지 처리 중 오류가 발생했습니다');
    }
  }

  async uploadImage(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('파일이 없습니다.');
    }

    try {
      await this.validateImage(file);

      const optimizedBuffer = await sharp(file.buffer || file.path)
        .resize(800, 800, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: 80 })
        .toBuffer();

      try {
        // 원본 파일명에서 확장자를 제외한 이름 추출
        const originalName = path.parse(file.originalname).name;

        // 파일명 생성
        const fileName = `${originalName}-${Date.now()}.webp`;
        const filePath = `/uploads/images/${fileName}`;
        const fullPath = path.join(
          process.cwd(),
          'uploads',
          'images',
          fileName,
        );

        // sharp를 사용하여 이미지 처리
        await sharp(optimizedBuffer)
          .resize(500, 500, {
            fit: 'cover',
            position: 'centre',
          })
          .webp({ quality: 80 })
          .toFile(fullPath);

        // 원본 파일 삭제 시도
        if (file.path) {
          try {
            await fs.unlink(file.path);
          } catch (unlinkError) {
            // 원본 파일 삭제 실패는 무시
          }
        }

        return { url: filePath };
      } catch (error) {
        throw new BadRequestException('이미지 저장 중 오류가 발생했습니다.');
      }
    } catch (error) {
      throw error;
    }
  }

  async findByUser(userId: string) {
    return this.prisma.playlist.findMany({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        taggedUsers: {
          include: {
            user: true,
          },
        },
        tracks: {
          include: {
            track: {
              include: {
                artist: true,
                album: true,
              },
            },
          },
          orderBy: {
            position: 'asc',
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async reorderTracks(
    playlistId: string,
    tracks: { id: string; position: number }[],
  ) {
    const updates = tracks.map(({ id, position }) =>
      this.prisma.playlistTrack.update({
        where: { id },
        data: { position },
      }),
    );

    await this.prisma.$transaction(updates);

    return this.findOne(playlistId);
  }

  async getPopularPlaylists() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return this.prisma.playlist.findMany({
      where: {
        isPublic: true,
        updatedAt: {
          gte: thirtyDaysAgo,
        },
      },
      take: 20,
      orderBy: [{ likes: { _count: 'desc' } }, { updatedAt: 'desc' }],
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            tracks: true,
            likes: true,
          },
        },
      },
    });
  }
}
