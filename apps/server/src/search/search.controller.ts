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
    @Query('type') type: 'all' | 'albums' | 'tracks' | 'playlists' | 'users' = 'all',
    @Query('sort') sort: 'relevance' | 'newest' | 'popular' = 'relevance',
  ): Promise<SearchResponse> {
    return this.searchService.search(query, type, sort);
  }

  @Get('suggest')
  async getSuggestions(
    @Query('q') query: string,
  ): Promise<SuggestionResponse[]> {
    try {
      return this.searchService.getSuggestions(query);
    } catch (error) {
      console.error('Suggestion error:', error);
      throw error;
    }
  }

  @Post('sync')
  async syncData() {
    return this.searchService.syncData();
  }

  @Post('initialize')
  async initializeIndices() {
    return this.searchService.initializeIndices();
  }

  @Post('update-indices')
  async updateIndices() {
    return this.searchService.updateIndices();
  }
} 