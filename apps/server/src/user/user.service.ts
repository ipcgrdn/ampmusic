import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SearchService } from '../search/search.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { DEFAULT_AVATAR } from '../constants/default-avatar';
import { FeaturedArtistResponseDto } from './dto/featured-artist.dto';
import { FollowingUpdateDto } from './dto/following-updates.dto';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private searchService: SearchService,
  ) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        avatar: true,
        bio: true,
      },
    });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        bio: true,
        website: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updateUserDto.avatar === '') {
      updateUserDto.avatar = `${DEFAULT_AVATAR}&name=${encodeURIComponent(user.name)}`;
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        bio: true,
        website: true,
      },
    });

    await this.searchService.indexDocument('user', updatedUser);

    return updatedUser;
  }

  async deleteUser(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.delete({
      where: { id },
    });

    return { message: 'User deleted successfully' };
  }

  async searchUsers(query: string) {
    if (!query) return [];
    
    try {
      const users = await this.prisma.user.findMany({
        where: {
          name: {
            contains: query,
            mode: 'insensitive',
          },
        },
        select: {
          id: true,
          name: true,
          avatar: true,
        },
        take: 5,
      });

      return users;
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  }

  async getNotificationSettings(userId: string) {
    const settings = await this.prisma.notificationSetting.findUnique({
      where: { userId },
    });

    if (!settings) {
      // 설정이 없으면 기본값으로 생성
      return this.prisma.notificationSetting.create({
        data: { userId },
      });
    }

    return settings;
  }

  async updateNotificationSettings(
    userId: string,
    type: string,
    enabled: boolean,
  ) {
    const settings = await this.getNotificationSettings(userId);

    try {
      if (type === 'all') {
        const updatedSettings = await this.prisma.notificationSetting.update({
          where: { id: settings.id },
          data: {
            all: enabled,
            newAlbum: enabled,
            newPlaylist: enabled,
            comment: enabled,
            reply: enabled,
            like: enabled,
            follow: enabled,
            mention: enabled,
            album_tagged: enabled,
            playlist_tagged: enabled,
          },
        });

        // TODO: 실시간 알림 설정 변경 이벤트 발생
        // this.eventEmitter.emit('notificationSettingsUpdated', { userId, settings: updatedSettings });

        return updatedSettings;
      }

      const updateData = {
        [this.mapNotificationTypeToField(type)]: enabled,
        // 개별 설정이 모두 true면 all도 true로, 하나라도 false면 all은 false로
        ...(type !== 'all' && {
          all: enabled && await this.areAllSettingsEnabled(settings.id, type),
        }),
      };

      const updatedSettings = await this.prisma.notificationSetting.update({
        where: { id: settings.id },
        data: updateData,
      });

      // TODO: 실시간 알림 설정 변경 이벤트 발생
      // this.eventEmitter.emit('notificationSettingsUpdated', { userId, settings: updatedSettings });

      return updatedSettings;
    } catch (error) {
      console.error('Failed to update notification settings:', error);
      throw error;
    }
  }

  private async areAllSettingsEnabled(settingId: string, excludeType: string): Promise<boolean> {
    const settings = await this.prisma.notificationSetting.findUnique({
      where: { id: settingId },
    });

    if (!settings) return false;

    const relevantSettings = Object.entries(settings).filter(([key, _]) => 
      key !== 'id' && 
      key !== 'userId' && 
      key !== 'createdAt' && 
      key !== 'updatedAt' && 
      key !== 'all' &&
      key !== this.mapNotificationTypeToField(excludeType)
    );

    return relevantSettings.every(([_, value]) => value === true);
  }

  private mapNotificationTypeToField(type: string): string {
    const mappings: Record<string, string> = {
      NEW_ALBUM: 'newAlbum',
      NEW_PLAYLIST: 'newPlaylist',
      COMMENT: 'comment',
      REPLY: 'reply',
      LIKE: 'like',
      FOLLOW: 'follow',
      MENTION: 'mention',
      ALBUM_TAGGED: 'album_tagged',
      PLAYLIST_TAGGED: 'playlist_tagged',
    };

    return mappings[type] || type.toLowerCase();
  }

  async getFeaturedArtists(): Promise<FeaturedArtistResponseDto[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // 모든 아티스트 조회
    const artists = await this.prisma.user.findMany({
      include: {
        _count: {
          select: {
            followers: true,
          }
        },
        followers: {
          where: {
            createdAt: {
              gte: thirtyDaysAgo
            }
          }
        },
        albums: {
          orderBy: { releaseDate: 'desc' },
          take: 1,
          include: {
            _count: {
              select: {
                likes: true,
              }
            },
            likes: {
              where: {
                createdAt: {
                  gte: thirtyDaysAgo
                }
              }
            },
            tracks: {
              include: {
                _count: {
                  select: {
                    activityLogs: true
                  }
                },
                activityLogs: {
                  where: {
                    type: 'PLAY',
                    createdAt: {
                      gte: thirtyDaysAgo
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    // 각 아티스트의 메트릭 계산
    const featuredArtists = artists.map((artist) => {
      // 팔로워 증가율 계산
      const currentFollowers = artist._count.followers;
      const newFollowers = artist.followers.length;
      const followerGrowth = currentFollowers === 0 ? 
        0 : (newFollowers / currentFollowers) * 100;

      // 좋아요 증가율 계산
      const currentLikes = artist.albums.reduce((sum, album) => 
        sum + album._count.likes, 0);
      const newLikes = artist.albums.reduce((sum, album) => 
        sum + album.likes.length, 0);
      const likeGrowth = currentLikes === 0 ? 
        0 : (newLikes / currentLikes) * 100;

      // 재생수 증가율 계산
      const currentPlays = artist.albums.reduce((sum, album) => 
        sum + album.tracks.reduce((trackSum, track) => 
          trackSum + track._count.activityLogs, 0), 0);
      const newPlays = artist.albums.reduce((sum, album) => 
        sum + album.tracks.reduce((trackSum, track) => 
          trackSum + track.activityLogs.length, 0), 0);
      const playGrowth = currentPlays === 0 ? 
        0 : (newPlays / currentPlays) * 100;

      // 종합 점수 계산 (가중치 적용)
      const score = 
        (followerGrowth * 0.4) + 
        (likeGrowth * 0.3) + 
        (playGrowth * 0.3);

      return {
        id: artist.id,
        name: artist.name,
        avatar: artist.avatar,
        bio: artist.bio,
        metrics: {
          followers: currentFollowers,
          followerGrowth,
          likes: currentLikes,
          likeGrowth,
          plays: currentPlays,
          playGrowth,
          score
        },
        recentAlbum: artist.albums[0] ? {
          id: artist.albums[0].id,
          title: artist.albums[0].title,
          coverImage: artist.albums[0].coverImage,
          releaseDate: artist.albums[0].releaseDate.toISOString()
        } : undefined
      };
    });

    // 점수 기준으로 정렬하고 상위 10명만 반환
    return featuredArtists
      .sort((a, b) => b.metrics.score - a.metrics.score)
      .slice(0, 10);
  }

  async getFollowingUpdates(userId: string): Promise<FollowingUpdateDto[]> {
    const following = await this.prisma.follow.findMany({
      where: {
        followerId: userId,
      },
      select: {
        following: {
          select: {
            id: true,
          },
        },
      },
    });

    const followingIds = following.map((f) => f.following.id);

    const [albums, playlists] = await Promise.all([
      // 팔로우한 유저들의 최신 앨범
      this.prisma.album.findMany({
        where: {
          artistId: {
            in: followingIds,
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 20,
        include: {
          artist: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          _count: {
            select: {
              tracks: true,
            },
          },
        },
      }),
      // 팔로우한 유저들의 최신 플레이리스트
      this.prisma.playlist.findMany({
        where: {
          userId: {
            in: followingIds,
          },
          isPublic: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 20,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          tracks: {
            select: {
              id: true,
            },
          },
        },
      }),
    ]);

    // 앨범과 플레이리스트를 합치고 시간순으로 정렬
    const updates = [
      ...albums.map((album) => ({
        id: `album-${album.id}`,
        type: 'ALBUM' as const,
        createdAt: album.createdAt.toISOString(),
        user: album.artist,
        item: {
          id: album.id,
          title: album.title,
          coverImage: album.coverImage,
          description: album.description,
          trackCount: album._count.tracks,
        },
      })),
      ...playlists.map((playlist) => ({
        id: `playlist-${playlist.id}`,
        type: 'PLAYLIST' as const,
        createdAt: playlist.createdAt.toISOString(),
        user: playlist.user,
        item: {
          id: playlist.id,
          title: playlist.title,
          coverImage: playlist.coverImage,
          description: playlist.description,
          trackCount: playlist.tracks.length,
        },
      })),
    ].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ).slice(0, 20);

    return updates;
  }

  // 팔로우한 유저들의 최근 활동 조회
  async getFollowingActivity(userId: string) {
    // 1. 팔로우하는 유저들의 ID 목록 조회
    const following = await this.prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });

    const followingIds = following.map(f => f.followingId);

    // 2. 최근 24시간 동안의 활동 로그 조회
    const activities = await this.prisma.userActivityHistory.findMany({
      where: {
        userId: { in: followingIds },
        type: 'PLAY',
        targetType: 'Track',
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // 3. 각 활동에 대한 트랙 정보 조회
    const enrichedActivities = await Promise.all(
      activities.map(async (activity) => {
        const track = await this.prisma.track.findUnique({
          where: { id: activity.targetId },
          include: {
            album: {
              select: {
                id: true,
                title: true,
                coverImage: true,
                artist: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        });

        return {
          id: activity.id,
          type: activity.type,
          createdAt: activity.createdAt,
          user: activity.user,
          track: track ? {
            id: track.id,
            trackUrl: track.audioUrl,
            title: track.title,
            album: track.album,
            description: track.description,
            credit: track.credit,
            lyrics: track.lyrics,
          } : null,
        };
      })
    );

    // 4. 중복 제거 (같은 유저가 같은 곡을 여러 번 들은 경우)
    const uniqueActivities = enrichedActivities.reduce((acc, curr) => {
      if (!curr.track) return acc;
      
      const key = `${curr.user.id}-${curr.track.id}`;
      if (!acc[key] || new Date(curr.createdAt) > new Date(acc[key].createdAt)) {
        acc[key] = curr;
      }
      return acc;
    }, {} as Record<string, typeof enrichedActivities[0]>);

    return Object.values(uniqueActivities);
  }

  // 사용자 활동 기록
  async recordActivity(
    userId: string,
    type: string,
    targetType: string,
    targetId: string,
    metadata?: any
  ) {
    return this.prisma.userActivityHistory.create({
      data: {
        userId,
        type,
        targetType,
        targetId,
        metadata,
      },
    });
  }2

  // 트랙 상세 정보 조회
  async getTrackWithDetails(trackId: string) {
    return this.prisma.track.findUnique({
      where: { id: trackId },
      include: {
        album: {
          select: {
            id: true,
            title: true,
            coverImage: true,
            artist: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }

  // 팔로우한 유저들의 좋아요 활동 조회 (최근 30일)
  async getFollowingLikes(userId: string) {
    const following = await this.prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });

    const followingIds = following.map(f => f.followingId);

    const activities = await this.prisma.userActivityHistory.findMany({
      where: {
        userId: { in: followingIds },
        type: 'LIKE',
        targetType: 'TRACK',
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // 각 활동에 대한 트랙 정보를 따로 조회
    const activitiesWithTracks = await Promise.all(
      activities.map(async (activity) => {
        const track = await this.prisma.track.findUnique({
          where: { id: activity.targetId },
          select: {
            id: true,
            title: true,
            audioUrl: true,
            duration: true,
            lyrics: true,
            description: true,
            credit: true,
            plays: true,
            album: {
              select: {
                id: true,
                title: true,
                coverImage: true,
                artist: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        });

        return {
          ...activity,
          track,
        };
      })
    );

    return activitiesWithTracks;
  }
} 