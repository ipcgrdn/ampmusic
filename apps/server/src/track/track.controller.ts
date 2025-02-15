import { Controller, Get, Param, UseGuards, Post, Body } from '@nestjs/common';
import { TrackService } from './track.service';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('tracks')
@UseGuards(JwtGuard)
export class TrackController {
  constructor(private readonly trackService: TrackService) {}

  @Get('recommendations')
  async getRecommendations(@GetUser('id') userId: string) {
    return this.trackService.getRecommendationsByActivity(userId);
  }

  @Get('similar-users-tracks')
  async getSimilarUsersTracks(@GetUser('id') userId: string) {
    return this.trackService.getSimilarUsersTracks(userId);
  }

  @Post('recommendations/from-queue')
  async getRecommendationsFromQueue(@Body() data: { trackIds: string[] }) {
    return this.trackService.getRecommendedTracksFromQueue(data.trackIds);
  }

  @Get()
  async findAll() {
    return this.trackService.findAll();
  }

  @Get(':id')
  async getTrackById(@Param('id') id: string) {
    return this.trackService.getTrackById(id);
  }

  @Post(':id/plays')
  async recordPlay(
    @Param('id') trackId: string,
    @GetUser('id') userId: string,
  ) {
    return this.trackService.recordPlay(trackId, userId);
  }

  @Get('charts/realtime')
  async getRealtimeChart() {
    return this.trackService.getRealtimeChart();
  }
}
