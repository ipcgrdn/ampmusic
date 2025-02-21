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
        const node = process.env.ELASTICSEARCH_URL || 'http://amp-elasticsearch.internal:9200';
        console.log('Elasticsearch URL:', node); // URL 확인용 로그

        return new Client({
          nodes: [node],
          auth: {
            username: process.env.ELASTICSEARCH_USERNAME || 'amp_elastic',
            password: process.env.ELASTICSEARCH_PASSWORD || 'My$uperS3cure!Passw0rd'
          }
        });
      },
    },
  ],
  exports: [SearchService],
})
export class SearchModule implements OnModuleInit {
  constructor(private readonly searchService: SearchService) {}

  async onModuleInit() {
    await this.searchService.initializeIndices();
    await this.searchService.syncData();
  }
} 