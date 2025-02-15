export class FollowingUpdateDto {
  id: string;
  type: 'ALBUM' | 'PLAYLIST';
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatar: string;
  };
  item: {
    id: string;
    title: string;
    coverImage: string;
    description?: string;
    trackCount: number;
  };
} 