import {
  Injectable,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Client } from '@elastic/elasticsearch';
import { SearchResponse } from './types/search.types';
import { Prisma } from '@prisma/client';
import { Sort } from '@elastic/elasticsearch/lib/api/types';

interface SearchHit {
  _index: string;
  _id: string;
  _score: number;
  highlight?: {
    title?: string[];
    description?: string[];
    name?: string[];
  };
}

// 자동완성 응답을 위한 인터페이스 수정
interface SuggestionOption {
  text: string;
  _index: string;
  _score: number;
}

interface SuggestResponse {
  hits: {
    hits: any[];
  };
  suggest: {
    title_suggestions: Array<{
      options: SuggestionOption[];
    }>;
    name_suggestions: Array<{
      options: SuggestionOption[];
    }>;
  };
}

@Injectable()
export class SearchService {
  constructor(
    @Inject('ELASTICSEARCH_CLIENT')
    private readonly elasticsearchClient: Client,
    private prisma: PrismaService,
  ) {}

  async search(
    query: string,
    type: 'all' | 'albums' | 'tracks' | 'playlists' | 'users',
    sort: 'relevance' | 'newest' | 'popular',
  ): Promise<SearchResponse> {
    try {
      console.log('검색 시작 - 쿼리:', query, '타입:', type, '정렬:', sort);
      
      if (!query) {
        console.log('쿼리가 비어있어 빈 결과 반환');
        return {
          albums: [],
          tracks: [],
          playlists: [],
          users: [],
        };
      }

      const indices =
        type === 'all' ? ['albums', 'tracks', 'playlists', 'users'] : [type];
      const sortConfig = this.getSortConfig(sort);

      console.log('검색할 인덱스:', indices);
      console.log('정렬 설정:', JSON.stringify(sortConfig));
      
      const searchParams = {
        index: indices,
        query: {
          bool: {
            should: [
              // 정확한 매칭 (높은 점수)
              {
                multi_match: {
                  query,
                  fields: [
                    'title^3',
                    'title.keyword^4',
                    'description^2',
                    'name^2',
                  ],
                  type: 'phrase',
                  boost: 2,
                },
              },
              // 부분 매칭
              {
                multi_match: {
                  query,
                  fields: ['title^2', 'title.ngram', 'description', 'name'],
                  type: 'best_fields',
                  operator: 'or',
                  fuzziness: 'AUTO',
                },
              },
              // 접두사 매칭
              {
                multi_match: {
                  query,
                  fields: ['title', 'description', 'name'],
                  type: 'phrase_prefix',
                  boost: 0.8,
                },
              },
            ],
            minimum_should_match: 1,
          },
        },
        sort: sortConfig,
        highlight: {
          pre_tags: ['<mark>'],
          post_tags: ['</mark>'],
          fields: {
            title: {},
            description: {},
            name: {},
          },
        },
      };
      
      console.log('ES 검색 쿼리:', JSON.stringify(searchParams));
      
      const response = await this.elasticsearchClient.search(searchParams);
      
      console.log('ES 응답 받음');
      console.log('ES 응답 총 히트 수:', JSON.stringify(response.hits.total));
      
      // 결과 ID 추출 및 하이라이트 정보 저장
      const hits = response.hits.hits as SearchHit[];
      const highlights = new Map<
        string,
        { title?: string; description?: string; name?: string }
      >();

      hits.forEach((hit) => {
        if (hit.highlight) {
          highlights.set(hit._id, {
            title: hit.highlight.title?.[0],
            description: hit.highlight.description?.[0],
            name: hit.highlight.name?.[0],
          });
        }
      });

      // 결과 ID 추출 및 분류
      const albumIds = response.hits.hits
        .filter((hit) => hit._index === 'albums')
        .map((hit) => hit._id);

      const trackIds = response.hits.hits
        .filter((hit) => hit._index === 'tracks')
        .map((hit) => hit._id);

      const playlistIds = response.hits.hits
        .filter((hit) => hit._index === 'playlists')
        .map((hit) => hit._id);

      const userIds = response.hits.hits
        .filter((hit) => hit._index === 'users')
        .map((hit) => hit._id);

      // 데이터베이스에서 실제 데이터 조회 및 하이라이트 정보 추가
      const [albums, tracks, playlists, users] = await Promise.all([
        type === 'all' || type === 'albums'
          ? this.prisma.album
              .findMany({
                where: { id: { in: albumIds } },
                include: { artist: true },
                orderBy: this.getDbSortConfig(
                  sort,
                ) as Prisma.AlbumOrderByWithRelationInput,
              })
              .then((albums) =>
                albums.map((album) => ({
                  ...album,
                  highlight: highlights.get(album.id),
                })),
              )
          : [],
        type === 'all' || type === 'tracks'
          ? this.prisma.track.findMany({
              where: { id: { in: trackIds } },
              include: { album: true, artist: true },
              orderBy: this.getDbSortConfig(
                sort,
              ) as Prisma.TrackOrderByWithRelationInput,
            })
          : [],
        type === 'all' || type === 'playlists'
          ? this.prisma.playlist.findMany({
              where: { id: { in: playlistIds } },
              include: { user: true },
              orderBy: this.getDbSortConfig(
                sort,
              ) as Prisma.PlaylistOrderByWithRelationInput,
            })
          : [],
        type === 'all' || type === 'users'
          ? this.prisma.user.findMany({
              where: { id: { in: userIds } },
              orderBy: this.getDbSortConfig(
                sort,
              ) as Prisma.UserOrderByWithRelationInput,
            })
          : [],
      ]);

      return { albums, tracks, playlists, users };
    } catch (error) {
      console.error('검색 처리 중 오류 발생:', error);
      console.error('오류 세부 정보:', JSON.stringify(error, null, 2));
      throw new InternalServerErrorException(
        '검색 처리 중 오류가 발생했습니다.',
      );
    }
  }

  private getSortConfig(sort: string): Sort {
    switch (sort) {
      case 'newest':
        return [{ createdAt: { order: 'desc' } }];
      case 'popular':
        return [{ plays: { order: 'desc' } }, { _score: { order: 'desc' } }];
      default: // 'relevance'
        return [{ _score: { order: 'desc' } }];
    }
  }

  private getDbSortConfig(sort: string) {
    switch (sort) {
      case 'newest':
        return {
          createdAt: Prisma.SortOrder.desc,
        };
      case 'popular':
        return {
          plays: Prisma.SortOrder.desc,
        };
      default: // 'relevance'
        return {
          createdAt: Prisma.SortOrder.desc,
        };
    }
  }

  async indexData() {
    const albums = await this.prisma.album.findMany();
    const tracks = await this.prisma.track.findMany();
    const playlists = await this.prisma.playlist.findMany();
    const users = await this.prisma.user.findMany();

    // 앨범 인덱싱
    for (const album of albums) {
      await this.elasticsearchClient.index({
        index: 'albums',
        id: album.id,
        document: {
          title: album.title,
          description: album.description,
        },
      });
    }

    // 트랙 인덱싱
    for (const track of tracks) {
      await this.elasticsearchClient.index({
        index: 'tracks',
        id: track.id,
        document: {
          title: track.title,
          albumId: track.albumId,
        },
      });
    }

    // 플레이리스트 인덱싱
    for (const playlist of playlists) {
      await this.elasticsearchClient.index({
        index: 'playlists',
        id: playlist.id,
        document: {
          title: playlist.title,
          description: playlist.description,
        },
      });
    }

    // 사용자 인덱싱
    for (const user of users) {
      await this.elasticsearchClient.index({
        index: 'users',
        id: user.id,
        document: {
          name: user.name,
          email: user.email,
        },
      });
    }
  }

  async initializeIndices() {
    // return; // 주석 제거
    const indices = ['albums', 'tracks', 'playlists', 'users'];

    for (const index of indices) {
      const exists = await this.elasticsearchClient.indices.exists({ index });

      if (!exists) {
        await this.elasticsearchClient.indices.create({
          index,
          body: {
            settings: {
              analysis: {
                analyzer: {
                  korean: {
                    type: 'custom',
                    tokenizer: 'nori_tokenizer',
                    filter: [
                      'nori_readingform',
                      'lowercase',
                      'trim',
                      'nori_part_of_speech',
                    ],
                  },
                  ngram_analyzer: {
                    type: 'custom',
                    tokenizer: 'ngram_tokenizer',
                    filter: ['lowercase', 'trim'],
                  },
                },
                tokenizer: {
                  ngram_tokenizer: {
                    type: 'ngram',
                    min_gram: 1,
                    max_gram: 2,
                    token_chars: ['letter', 'digit'],
                  },
                },
              },
            },
            mappings: {
              dynamic: 'strict',
              properties: {
                title: {
                  type: 'text',
                  analyzer: 'korean',
                  fields: {
                    keyword: { type: 'keyword' },
                    ngram: {
                      type: 'text',
                      analyzer: 'ngram_analyzer',
                    },
                    suggest: {
                      type: 'completion',
                      analyzer: 'korean',
                    },
                  },
                },
                description: {
                  type: 'text',
                  analyzer: 'korean',
                  fields: {
                    keyword: { type: 'keyword' },
                  },
                },
                name: {
                  type: 'text',
                  analyzer: 'korean',
                  fields: {
                    keyword: { type: 'keyword' },
                    suggest: {
                      type: 'completion',
                      analyzer: 'korean',
                    },
                  },
                },
                email: { type: 'keyword' },
                albumId: { type: 'keyword' },
                createdAt: { type: 'date' },
                updatedAt: { type: 'date' },
                plays: { type: 'long' },
              },
            },
          },
        });
      }
    }
  }

  async syncData() {
    try {
      // 모든 유저 동기화
      const users = await this.prisma.user.findMany();
      for (const user of users) {
        await this.indexDocument('user', user);
      }

      // 모든 앨범 동기화
      const albums = await this.prisma.album.findMany({
        include: {
          artist: true,
        },
      });
      for (const album of albums) {
        await this.indexDocument('album', album);
      }

      // 모든 트랙 동기화
      const tracks = await this.prisma.track.findMany({
        include: {
          artist: true,
          album: true,
        },
      });
      for (const track of tracks) {
        await this.indexDocument('track', track);
      }

      // 모든 플레이리스트 동기화
      const playlists = await this.prisma.playlist.findMany({
        include: {
          user: true,
        },
      });
      for (const playlist of playlists) {
        await this.indexDocument('playlist', playlist);
      }
    } catch (error) {
      console.error('데이터 동기화 중 오류 발생:', error);
      throw new InternalServerErrorException('데이터 동기화에 실패했습니다');
    }
  }

  async getSuggestions(query: string) {
    try {
      console.log('자동완성 요청 시작 - 쿼리:', query);
      
      if (!query || query.length < 2) {
        console.log('쿼리가 너무 짧아 빈 결과 반환');
        return [];
      }

      // 1. 인덱스 존재 여부 확인
      const indices = ['albums', 'tracks', 'playlists', 'users'];
      console.log('인덱스 존재 여부 확인 중:', indices);
      for (const index of indices) {
        const exists = await this.elasticsearchClient.indices.exists({ index });
        console.log(`인덱스 ${index} 존재 여부:`, exists);
      }

      // 2. 매핑 정보 확인
      console.log('현재 매핑 정보 확인 중...');
      const mappings = await this.elasticsearchClient.indices.getMapping({
        index: indices,
      });
      console.log('매핑 정보:', JSON.stringify(mappings));

      console.log('자동완성 쿼리 실행 준비:');
      const suggestQuery = {
        index: indices,
        suggest: {
          title_suggestions: {
            prefix: query,
            completion: {
              field: 'title.suggest',
              size: 5,
              skip_duplicates: true,
              fuzzy: {
                fuzziness: 'AUTO',
              },
            },
          },
          name_suggestions: {
            prefix: query,
            completion: {
              field: 'name.suggest',
              size: 5,
              skip_duplicates: true,
              fuzzy: {
                fuzziness: 'AUTO',
              },
            },
          },
        },
      };
      
      console.log('자동완성 ES 쿼리:', JSON.stringify(suggestQuery));
      
      const response = await this.elasticsearchClient.search<SuggestResponse>(suggestQuery);
      
      console.log('자동완성 응답 받음:', response ? '성공' : '실패');
      
      const titleSuggestions = (response.suggest?.title_suggestions?.[0]
        ?.options || []) as SuggestionOption[];
      
      const nameSuggestions = (response.suggest?.name_suggestions?.[0]
        ?.options || []) as SuggestionOption[];
      
      console.log('제목 제안 수:', titleSuggestions.length);
      console.log('이름 제안 수:', nameSuggestions.length);
      
      const suggestions = [...titleSuggestions, ...nameSuggestions].map(
        (option) => ({
          text: option.text,
          type: option._index,
          score: option._score,
        }),
      );

      return suggestions.slice(0, 5);
    } catch (error) {
      console.error('자동완성 요청 처리 오류:', error);
      if (error.meta && error.meta.body) {
        console.error('ES 오류 응답:', JSON.stringify(error.meta.body));
      }
      console.error('스택 트레이스:', error.stack);
      throw new InternalServerErrorException(
        `자동완성 처리 중 오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`,
      );
    }
  }

  async indexDocument(
    type: 'album' | 'track' | 'playlist' | 'user',
    document: any,
  ) {
    try {
      const index = `${type}s`; // albums, tracks, playlists, users

      const baseDocument = {
        id: document.id,
        createdAt: document.createdAt,
        updatedAt: document.updatedAt,
      };

      const typeSpecificFields = {
        album: {
          title: document.title,
          description: document.description,
          artist: document.artist?.name,
          artistId: document.artist?.id,
        },
        track: {
          title: document.title,
          artist: document.artist?.name,
          artistId: document.artist?.id,
          album: document.album?.title,
          albumId: document.album?.id,
        },
        playlist: {
          title: document.title,
          description: document.description,
          userId: document.userId,
          isPublic: document.isPublic,
        },
        user: {
          name: document.name,
          email: document.email,
          bio: document.bio,
          avatar: document.avatar,
        },
      };

      await this.elasticsearchClient.index({
        index,
        id: document.id,
        document: {
          ...baseDocument,
          ...typeSpecificFields[type],
        },
      });

      await this.elasticsearchClient.indices.refresh({ index });
    } catch (error) {
      console.error(`Failed to index ${type}:`, error);
      throw new InternalServerErrorException(
        '검색 인덱스 업데이트에 실패했습니다',
      );
    }
  }

  async updateIndices() {
    const indices = ['albums', 'tracks', 'playlists', 'users'];

    for (const index of indices) {
      const exists = await this.elasticsearchClient.indices.exists({ index });

      if (exists) {
        // 1. 기존 인덱스의 별칭 생성
        await this.elasticsearchClient.indices.putAlias({
          index,
          name: `${index}_old`,
        });

        // 2. 새로운 인덱스 생성 (임시 이름)
        const tempIndex = `${index}_new`;
        await this.elasticsearchClient.indices.create({
          index: tempIndex,
          settings: {
            analysis: {
              analyzer: {
                korean: {
                  type: 'custom',
                  tokenizer: 'nori_tokenizer',
                  filter: ['nori_readingform', 'lowercase'],
                },
              },
            },
          },
          mappings: {
            properties: {
              title: {
                type: 'text',
                analyzer: 'korean',
                fields: {
                  suggest: {
                    type: 'completion',
                    analyzer: 'korean',
                    preserve_separators: true,
                    preserve_position_increments: true,
                    max_input_length: 50,
                  },
                },
              },
              description: {
                type: 'text',
                analyzer: 'korean',
              },
              name: {
                type: 'text',
                analyzer: 'korean',
                fields: {
                  suggest: {
                    type: 'completion',
                    analyzer: 'korean',
                    preserve_separators: true,
                    preserve_position_increments: true,
                    max_input_length: 50,
                  },
                },
              },
              email: { type: 'keyword' },
              albumId: { type: 'keyword' },
            },
          },
        });

        // 3. 기존 데이터를 새 인덱스로 재색인
        await this.elasticsearchClient.reindex({
          source: { index },
          dest: { index: tempIndex },
        });

        // 4. 기존 인덱스 삭제
        await this.elasticsearchClient.indices.delete({ index });

        // 5. 새 인덱스 이름 변경
        await this.elasticsearchClient.indices.putAlias({
          index: tempIndex,
          name: index,
        });

        // 6. 임시 인덱스 삭제
        await this.elasticsearchClient.indices.delete({
          index: tempIndex,
        });
      }
    }

    // 7. 데이터 재동기화
    await this.syncData();

    return { message: '인덱스가 성공적으로 업데이트되었습니다.' };
  }
}
