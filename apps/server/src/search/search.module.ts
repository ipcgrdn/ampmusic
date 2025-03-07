import { Module, OnModuleInit } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { PrismaModule } from '../prisma/prisma.module';
import { Client } from '@elastic/elasticsearch';

@Module({
  imports: [PrismaModule],
  controllers: [SearchController],
  providers: [
    SearchService,
    {
      provide: 'ELASTICSEARCH_CLIENT',
      useFactory: () => {
        const node = process.env.ELASTICSEARCH_URL || 'http://127.0.0.1:9200';

        return new Client({
          node: node,
          tls: {
            rejectUnauthorized: false,
          },
        });
      },
    },
  ],
  exports: [SearchService],
})
export class SearchModule implements OnModuleInit {
  constructor(private readonly searchService: SearchService) {}

  async onModuleInit() {
    // 개발 환경에서는 동기화를 건너뜁니다
    if (process.env.NODE_ENV === 'development') {
      console.log('로컬 개발 환경: 검색 인덱스 동기화를 건너뜁니다.');
      return;
    }

    await this.searchService.initializeIndices();
    await this.searchService.syncData();
  }
}
