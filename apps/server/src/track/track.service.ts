import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { TrackRecommendationDto } from './dto/track-recommendation.dto';
import { SimilarUsersTracksDto } from './dto/similar-users-tracks.dto';

@Injectable()
export class TrackService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async findAll() {
    return this.prisma.track.findMany({
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
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const track = await this.prisma.track.findUnique({
      where: { id },
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
    });

    if (!track) {
      throw new NotFoundException('Track not found');
    }

    return track;
  }

  async recordPlay(trackId: string, userId: string) {
    // 트랜잭션으로 모든 기록을 한번에 처리
    await this.prisma.$transaction(async (tx) => {
      // 1. 기존의 트랙 재생 기록 생성
      await tx.trackActivityLog.create({
        data: {
          trackId,
          type: 'PLAY',
        },
      });

      // 2. 기존의 트랙 재생수 업데이트
      await tx.track.update({
        where: { id: trackId },
        data: {
          plays: {
            increment: 1,
          },
        },
      });

      // 3. 사용자 활동 기록 추가
      await tx.userActivityHistory.create({
        data: {
          userId,
          type: 'PLAY',
          targetType: 'Track',
          targetId: trackId,
          metadata: {
            timestamp: new Date().toISOString(),
          },
        },
      });
    });

    // Redis 차트 데이터 업데이트는 트랜잭션 외부에서 처리
    await this.redis.incrementTrackPlay(trackId);
  }

  async getRealtimeChart() {
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(0, 0, 0, 0);

    const tracks = await this.prisma.track.findMany({
      where: {
        OR: [
          {
            activityLogs: {
              some: {
                type: 'PLAY',
                createdAt: {
                  gte: twentyFourHoursAgo
                }
              }
            }
          },
          {
            likes: {
              some: {
                createdAt: {
                  gte: twentyFourHoursAgo
                }
              }
            }
          }
        ]
      },
      select: {
        id: true,
        title: true,
        duration: true,
        audioUrl: true,
        description: true,
        credit: true,
        plays: true,
        lyrics: true,
        album: {
          select: {
            id: true,
            title: true,
            coverImage: true,
            artist: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        },
        artist: {
          select: {
            id: true,
            name: true,
          }
        },
        _count: {
          select: {
            activityLogs: {
              where: {
                type: 'PLAY',
                createdAt: {
                  gte: twentyFourHoursAgo
                }
              }
            },
            likes: {
              where: {
                createdAt: {
                  gte: twentyFourHoursAgo
                }
              }
            }
          }
        }
      }
    });

    // 점수 계산 및 정렬
    const scoredTracks = await Promise.all(
      tracks.map(async (track) => {
        const score = track._count.activityLogs * 0.8 + track._count.likes * 0.2;
        const previousRank = await this.redis.getPreviousRank(track.id);

        return {
          ...track,
          realtimePlays: track._count.activityLogs,
          realtimeLikes: track._count.likes,
          score,
          previousRank,
          _count: undefined,
        };
      })
    );

    const sortedTracks = scoredTracks.sort((a, b) => b.score - a.score);

    // 현재 순위를 Redis에 저장
    const newRanks = new Map();
    sortedTracks.forEach((track, index) => {
      newRanks.set(track.id, index + 1);
    });
    await this.redis.setMultipleRanks(newRanks);

    // 상위 100곡만 반환
    return sortedTracks.slice(0, 100);
  }

  async getRecommendationsByActivity(userId: string): Promise<TrackRecommendationDto[]> {
    const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    
    // 1. 사용자의 다양한 활동 이력 수집
    const userActivities = await this.prisma.userActivityHistory.findMany({
      where: {
        userId,
        createdAt: { gte: twoWeeksAgo },
        OR: [
          { type: 'PLAY' },
          { type: 'LIKE' },
          { type: 'FOLLOW' }
        ]
      },
      orderBy: { createdAt: 'desc' }
    });

    // 2. 활동 유형별로 분류
    const playedTrackIds = new Set(
      userActivities
        .filter(a => a.type === 'PLAY' && a.targetType === 'TRACK')
        .map(a => a.targetId)
    );
    
    const likedTrackIds = new Set(
      userActivities
        .filter(a => a.type === 'LIKE' && a.targetType === 'TRACK')
        .map(a => a.targetId)
    );
    
    const followedArtistIds = new Set(
      userActivities
        .filter(a => a.type === 'FOLLOW' && a.targetType === 'USER')
        .map(a => a.targetId)
    );

    // 3. 다양한 추천 트랙 수집
    const [
      artistBasedTracks,          // 자주 들은 아티스트의 다른 곡
      followedArtistTracks,       // 팔로우한 아티스트의 최신곡
      similarUsersTracks,         // 비슷한 취향의 유저들이 좋아하는 곡
      recentPopularTracks         // 전반적으로 인기있는 최신곡
    ] = await Promise.all([
      // 3.1 자주 들은 아티스트의 다른 곡
      this.getTracksFromFrequentArtists(playedTrackIds, likedTrackIds),
      
      // 3.2 팔로우한 아티스트의 최신곡
      this.getTracksFromFollowedArtists(followedArtistIds, playedTrackIds),
      
      // 3.3 비슷한 취향의 유저들이 좋아하는 곡
      this.getTracksFromSimilarUsers(userId, playedTrackIds, likedTrackIds),
      
      // 3.4 전반적으로 인기있는 최신곡
      this.getPopularNewTracks(playedTrackIds)
    ]);

    // 4. 결과 조합 및 가중치 부여
    const allRecommendations = [
      ...artistBasedTracks.map(track => ({
        ...track,
        recommendReason: {
          type: 'ARTIST' as const,
          description: `${track.album.artist.name}의 인기곡입니다`
        }
      })),
      ...followedArtistTracks.map(track => ({
        ...track,
        recommendReason: {
          type: 'FOLLOW' as const,
          description: `팔로우한 ${track.album.artist.name}의 최신곡입니다`
        }
      })),
      ...similarUsersTracks.map(track => ({
        ...track,
        recommendReason: {
          type: 'SIMILAR' as const,
          description: '비슷한 취향의 유저들이 좋아하는 곡입니다'
        }
      })),
      ...recentPopularTracks.map(track => ({
        ...track,
        recommendReason: {
          type: 'POPULAR' as const,
          description: '지금 주목받는 인기곡입니다'
        }
      }))
    ];

    // 5. 다양성을 위해 섞어서 반환
    return this.shuffleAndLimit(allRecommendations, 20) as TrackRecommendationDto[];
  }

  // 자주 들은 아티스트의 다른 곡 조회
  private async getTracksFromFrequentArtists(playedTrackIds: Set<string>, likedTrackIds: Set<string>) {
    const tracks = await this.prisma.track.findMany({
      where: {
        artist: {
          tracks: {
            some: {
              id: {
                in: Array.from([...playedTrackIds, ...likedTrackIds])
              }
            }
          }
        },
        NOT: {
          id: {
            in: Array.from([...playedTrackIds, ...likedTrackIds])
          }
        }
      },
      include: {
        album: {
          include: {
            artist: true
          }
        }
      },
      orderBy: {
        plays: 'desc'
      },
      take: 10
    });
    return tracks;
  }

  // 팔로우한 아티스트의 최신곡 조회
  private async getTracksFromFollowedArtists(followedArtistIds: Set<string>, playedTrackIds: Set<string>) {
    return this.prisma.track.findMany({
      where: {
        artistId: {
          in: Array.from(followedArtistIds)
        },
        NOT: {
          id: {
            in: Array.from(playedTrackIds)
          }
        }
      },
      include: {
        album: {
          include: {
            artist: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });
  }

  // 비슷한 취향의 유저들이 좋아하는 곡 조회
  private async getTracksFromSimilarUsers(userId: string, playedTrackIds: Set<string>, likedTrackIds: Set<string>) {
    // 1. 비슷한 유저 찾기 (같은 곡을 좋아하는 유저들)
    const similarUsers = await this.prisma.userActivityHistory.findMany({
      where: {
        type: 'LIKE',
        targetType: 'TRACK',
        targetId: {
          in: Array.from(likedTrackIds)
        },
        NOT: {
          userId
        }
      },
      select: {
        userId: true
      },
      distinct: ['userId'],
      take: 10
    });

    // 2. 그 유저들이 좋아하는 다른 곡들 조회
    return this.prisma.track.findMany({
      where: {
        likes: {
          some: {
            userId: {
              in: similarUsers.map(u => u.userId)
            }
          }
        },
        NOT: {
          id: {
            in: Array.from([...playedTrackIds, ...likedTrackIds])
          }
        }
      },
      include: {
        album: {
          include: {
            artist: true
          }
        }
      },
      orderBy: {
        plays: 'desc'
      },
      take: 10
    });
  }

  // 전반적으로 인기있는 최신곡 조회
  private async getPopularNewTracks(playedTrackIds: Set<string>) {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    return this.prisma.track.findMany({
      where: {
        createdAt: {
          gte: oneWeekAgo
        },
        NOT: {
          id: {
            in: Array.from(playedTrackIds)
          }
        }
      },
      include: {
        album: {
          include: {
            artist: true
          }
        }
      },
      orderBy: {
        plays: 'desc'
      },
      take: 10
    });
  }

  // 결과 섞기 및 제한
  private shuffleAndLimit<T>(array: T[], limit: number): T[] {
    const shuffled = [...array].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, limit);
  }

  async getSimilarUsersTracks(userId: string): Promise<SimilarUsersTracksDto[]> {
    // 1. 현재 사용자가 좋아하는 트랙 조회
    const userLikes = await this.prisma.like.findMany({
      where: {
        userId,
        itemType: 'track'
      },
      select: {
        itemId: true
      }
    });

    const userLikedTrackIds = userLikes.map(like => like.itemId);

    // 2. 비슷한 취향의 유저 찾기 (같은 트랙을 좋아하는 유저들)
    const similarUsers = await this.prisma.like.findMany({
      where: {
        itemType: 'track',
        itemId: {
          in: userLikedTrackIds
        },
        NOT: {
          userId
        }
      },
      select: {
        userId: true
      },
      distinct: ['userId']
    });

    const similarUserIds = similarUsers.map(user => user.userId);

    // 3. 비슷한 취향의 유저들이 좋아하는 다른 트랙들 조회
    const tracks = await this.prisma.track.findMany({
      where: {
        likes: {
          some: {
            userId: {
              in: similarUserIds
            }
          }
        },
        NOT: {
          id: {
            in: userLikedTrackIds // 이미 현재 유저가 좋아하는 트랙 제외
          }
        }
      },
      include: {
        album: {
          include: {
            artist: true
          }
        },
        likes: {
          where: {
            userId: {
              in: similarUserIds
            }
          }
        },
        _count: {
          select: {
            likes: true
          }
        }
      },
      orderBy: [
        {
          likes: {
            _count: 'desc'
          }
        },
        {
          plays: 'desc'
        }
      ],
      take: 20
    });

    // 4. DTO 형식으로 변환하여 반환
    return tracks.map(track => ({
      id: track.id,
      title: track.title,
      duration: track.duration,
      lyrics: track.lyrics,
      description: track.description,
      credit: track.credit,
      audioUrl: track.audioUrl,
      plays: track.plays,
      likedByCount: track._count.likes,
      album: {
        id: track.album.id,
        title: track.album.title,
        coverImage: track.album.coverImage,
        artist: {
          id: track.album.artist.id,
          name: track.album.artist.name
        }
      }
    }));
  }

  async getTrackById(id: string) {
    const track = await this.prisma.track.findUnique({
      where: { id },
      include: {
        album: {
          include: {
            artist: true,
          },
        },
      },
    });

    if (!track) {
      throw new NotFoundException('트랙을 찾을 수 없습니다');
    }

    return track;
  }

  async getRecommendedTracksFromQueue(queueTrackIds: string[]) {
    // 1. 현재 큐의 트랙들 정보 가져오기
    const queueTracks = await this.prisma.track.findMany({
      where: {
        id: {
          in: queueTrackIds
        }
      },
      include: {
        album: {
          include: {
            artist: true
          }
        },
        artist: true
      }
    });

    // 2. 큐의 트랙들이 속한 아티스트와 앨범 ID 수집
    const artistIds = [...new Set(queueTracks.map(track => track.album.artist.id))];
    const albumIds = [...new Set(queueTracks.map(track => track.album.id))];

    // 3. 추천 트랙 찾기
    const recommendedTracks = await this.prisma.track.findMany({
      where: {
        AND: [
          // 현재 큐에 없는 트랙만 선택
          {
            id: {
              notIn: queueTrackIds
            }
          },
          // 비슷한 특성을 가진 트랙 선택
          {
            OR: [
              // 같은 아티스트의 다른 트랙
              {
                album: {
                  artist: {
                    id: {
                      in: artistIds
                    }
                  }
                }
              },
              // 같은 앨범의 다른 트랙
              {
                albumId: {
                  in: albumIds
                }
              }
            ]
          }
        ]
      },
      include: {
        album: {
          include: {
            artist: true
          }
        },
        _count: {
          select: {
            likes: true,
            activityLogs: {
              where: {
                type: 'PLAY'
              }
            }
          }
        }
      },
      // 인기도순으로 정렬
      orderBy: [
        {
          activityLogs: {
            _count: 'desc'
          }
        },
        {
          likes: {
            _count: 'desc'
          }
        }
      ],
      // 적절한 수의 트랙만 선택
      take: 20
    });

    return recommendedTracks.map(track => ({
      ...track,
      realtimePlays: track._count.activityLogs,
      realtimeLikes: track._count.likes,
      _count: undefined,
      artist: track.album.artist
    }));
  }
}
