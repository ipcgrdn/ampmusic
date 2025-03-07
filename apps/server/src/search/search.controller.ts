import { Controller, Get, Query, Post } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchResponse } from './types/search.types';

interface SuggestionResponse {
  text: string;
  type: string;
  score: number;
}

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  async search(
    @Query('q') query: string,
    @Query('type')
    type: 'all' | 'albums' | 'tracks' | 'playlists' | 'users' = 'all',
    @Query('sort') sort: 'relevance' | 'newest' | 'popular' = 'relevance',
  ): Promise<SearchResponse> {
    // 개발 환경에서는 더미 데이터 반환
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `[개발 환경] 검색 요청 - 쿼리: "${query}", 타입: ${type}, 정렬: ${sort}`,
      );
      return {
        albums: [],
        tracks: [],
        playlists: [],
        users: [],
      };
    }

    // 프로덕션 환경에서는 실제 검색 실행
    return this.searchService.search(query, type, sort);
  }

  @Get('suggest')
  async getSuggestions(
    @Query('q') query: string,
  ): Promise<SuggestionResponse[]> {
    // 개발 환경에서는 빈 배열 반환
    if (process.env.NODE_ENV === 'development') {
      console.log(`[개발 환경] 검색 제안 요청 - 쿼리: "${query}"`);
      return [];
    }

    // 프로덕션 환경에서는 실제 제안 실행
    try {
      return this.searchService.getSuggestions(query);
    } catch (error) {
      console.error('Suggestion error:', error);
      throw error;
    }
  }

  @Post('sync')
  async syncData() {
    // 개발 환경에서는 성공 응답 반환
    if (process.env.NODE_ENV === 'development') {
      console.log('[개발 환경] 검색 인덱스 동기화 요청 (스킵)');
      return {
        success: true,
        message: '개발 환경에서는 동기화가 비활성화되었습니다.',
      };
    }

    // 프로덕션 환경에서는 실제 동기화 실행
    return this.searchService.syncData();
  }

  @Post('initialize')
  async initializeIndices() {
    // 개발 환경에서는 성공 응답 반환
    if (process.env.NODE_ENV === 'development') {
      console.log('[개발 환경] 검색 인덱스 초기화 요청 (스킵)');
      return {
        success: true,
        message: '개발 환경에서는 인덱스 초기화가 비활성화되었습니다.',
      };
    }

    // 프로덕션 환경에서는 실제 초기화 실행
    return this.searchService.initializeIndices();
  }

  @Post('update-indices')
  async updateIndices() {
    // 개발 환경에서는 성공 응답 반환
    if (process.env.NODE_ENV === 'development') {
      console.log('[개발 환경] 검색 인덱스 업데이트 요청 (스킵)');
      return {
        success: true,
        message: '개발 환경에서는 인덱스 업데이트가 비활성화되었습니다.',
      };
    }

    // 프로덕션 환경에서는 실제 업데이트 실행
    return this.searchService.updateIndices();
  }
}
