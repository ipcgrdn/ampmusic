import { api } from '../axios';
import { Follower } from '@/types/follow';

export interface PaginatedFollowers {
  followers: Follower[];
  total: number;
  page: number;
  totalPages: number;
}

export const followApi = {
  // 팔로우 토글
  toggle: async (userId: string) => {
    const { data } = await api.post<{ isFollowing: boolean }>(`/follows/${userId}`);
    
    // 팔로우 활동 기록 추가
    if (data.isFollowing) {
      await api.post('/users/activity', {
        type: 'FOLLOW',
        targetType: 'USER',
        targetId: userId,
        metadata: {
          action: 'add'
        }
      });
    }
    
    return data;
  },

  // 팔로우 상태 확인
  getStatus: async (userId: string) => {
    const { data } = await api.get<{ isFollowing: boolean }>(`/follows/${userId}`);
    return data;
  },

  // 팔로우 카운트 조회
  getCounts: async (userId: string) => {
    const { data } = await api.get<{ followers: number; following: number }>(
      `/follows/${userId}/counts`
    );
    return data;
  },

  // 새로운 메서드 추가
  getFollowers: async (userId: string, page = 1, limit = 20) => {
    const { data } = await api.get<PaginatedFollowers>(
      `/follows/${userId}/followers`,
      {
        params: { page, limit }
      }
    );
    return data;
  },
};

// Query Keys
export const FOLLOW_KEYS = {
  all: ['follows'] as const,
  status: (userId: string) => [...FOLLOW_KEYS.all, 'status', userId] as const,
  counts: (userId: string) => [...FOLLOW_KEYS.all, 'counts', userId] as const,
  followers: (userId: string) => [...FOLLOW_KEYS.all, 'followers', userId] as const,
}; 