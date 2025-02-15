export class FeaturedArtistResponseDto {
  id: string;
  name: string;
  avatar: string;
  bio: string | null;
  metrics: {
    followers: number;
    followerGrowth: number;  // 팔로워 증가율
    likes: number;
    likeGrowth: number;      // 좋아요 증가율
    plays: number;
    playGrowth: number;      // 재생수 증가율
    score: number;           // 종합 점수
  };
  recentAlbum?: {
    id: string;
    title: string;
    coverImage: string;
    releaseDate: string;
  };
} 