import { api } from '../axios';
import { Album, Track } from '@/types/album';
import { Playlist } from '@/types/playlist';
import { useQuery } from '@tanstack/react-query';

export type LikeableType = 'album' | 'track' | 'playlist';

interface LikedItems {
  tracks: Track[];
  albums: Album[];
  playlists: Playlist[];
}

// Query Keys 추가
export const LIKE_KEYS = {
  all: ['likes'] as const,
  lists: () => [...LIKE_KEYS.all, 'lists'] as const,
  list: (userId: string) => [...LIKE_KEYS.lists(), userId] as const,
  status: (type: string, id: string) => ['like-status', type, id] as const,
  count: (type: string, id: string) => ['like-count', type, id] as const,
};

export const likeApi = {
  toggle: async (type: LikeableType, id: string) => {
    const { data } = await api.post<{ isLiked: boolean }>(`/likes/${type}/${id}`);
    
    // 좋아요 활동 기록 추가
    if (data.isLiked) {
      await api.post('/users/activity', {
        type: 'LIKE',
        targetType: type.toUpperCase(),
        targetId: id,
        metadata: {
          action: 'add'
        }
      });
    }
    
    return data;
  },

  getStatus: async (type: LikeableType, id: string) => {
    const { data } = await api.get<{ isLiked: boolean }>(`/likes/${type}/${id}`);
    return data;
  },

  getCount: async (type: LikeableType, id: string) => {
    const { data } = await api.get<{ count: number }>(`/likes/count/${type}/${id}`);
    return data;
  },

  // 사용자의 좋아요 목록 가져오기
  getUserLikes: async (userId: string, type?: LikeableType) => {
    const params = type ? `?type=${type}` : '';
    const response = await api.get<LikedItems>(`/likes/users/${userId}/likes${params}`);
    console.log('API Response:', response.data);  // 응답 데이터 확인
    return response.data;
  }
};

// 기존 getLikedItems 함수를 likeApi.getUserLikes로 대체
export const getLikedItems = likeApi.getUserLikes;

// 선택적으로 사용할 수 있는 React Query Hook 추가
export function useUserLikes(userId: string | undefined) {
  return useQuery({
    queryKey: LIKE_KEYS.list(userId || ''),
    queryFn: () => likeApi.getUserLikes(userId!),
    enabled: !!userId,
    staleTime: 0, // 5분에서 0으로 변경하여 항상 최신 데이터 fetch
    refetchOnMount: true, // 컴포넌트 마운트시 refetch
    refetchOnWindowFocus: true, // 윈도우 포커스시 refetch
  });
} 