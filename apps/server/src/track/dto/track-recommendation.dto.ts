export class TrackRecommendationDto {
  id: string;
  title: string;
  duration: number;
  audioUrl: string;
  plays: number;
  album: {
    id: string;
    title: string;
    coverImage: string;
    artist: {
      id: string;
      name: string;
    };
  };
  recommendReason: {
    type: 'GENRE' | 'ARTIST' | 'MOOD';
    description: string;
  };
} 