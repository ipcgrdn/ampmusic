export class SimilarUsersTracksDto {
  id: string;
  title: string;
  duration: number;
  audioUrl: string;
  plays: number;
  likedByCount: number;  // 비슷한 취향 유저들 중 좋아요 수
  album: {
    id: string;
    title: string;
    coverImage: string;
    artist: {
      id: string;
      name: string;
    };
  };
} 