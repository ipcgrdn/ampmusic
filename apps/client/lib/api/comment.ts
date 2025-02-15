import { CommentType } from '@/components/comments/CommentForm';
import { api } from '../axios';

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  userId: string;
  user: {
    id: string;
    name: string;
    avatar: string;
  };
  parentId: string | null;
  replies: Comment[];
  replyCount: number;
  type: CommentType;
  targetId: string;
  mentions: {
    id: string;
    name: string;
  }[];
}

export interface CreateCommentDto {
  content: string;
  type: CommentType;
  targetId: string;
  parentId?: string;
}

export interface UpdateCommentDto {
  content: string;
}

interface CommentsResponse {
  comments: Comment[];
  hasMore: boolean;
  total: number;
}

export type CommentSortType = 'latest' | 'popular';

// 댓글 생성
export const createComment = async (data: CreateCommentDto): Promise<Comment> => {
  const response = await api.post<Comment>('/comments', data);
  return response.data;
};

// 댓글 목록 조회
export const getComments = async (
  type: CommentType, 
  targetId: string,
  page: number = 1,
  limit: number = 10,
  sort: CommentSortType = 'latest'
): Promise<CommentsResponse> => {
  const response = await api.get<CommentsResponse>(
    `/comments/${type}/${targetId}?page=${page}&limit=${limit}&sort=${sort}`
  );
  return response.data;
};

// 댓글 수정
export const updateComment = async (id: string, data: UpdateCommentDto): Promise<Comment> => {
  const response = await api.patch<Comment>(`/comments/${id}`, data);
  return response.data;
};

// 댓글 삭제
export const deleteComment = async (id: string): Promise<void> => {
  await api.delete(`/comments/${id}`);
};

// 댓글 수 조회 함수 추가
export const getCommentCount = async (type: CommentType, targetId: string): Promise<number> => {
  const response = await api.get<number>(`/comments/${type}/${targetId}/count`);
  return response.data;
};

// 댓글 좋아요 토글
export const toggleCommentLike = async (id: string): Promise<boolean> => {
  const response = await api.post<boolean>(`/comments/${id}/like`);
  return response.data;
};

// 댓글 좋아요 상태 확인
export const getCommentLikeStatus = async (id: string): Promise<boolean> => {
  const response = await api.get<boolean>(`/comments/${id}/like`);
  return response.data;
};

// 댓글 좋아요 수 조회
export const getCommentLikeCount = async (id: string): Promise<number> => {
  const response = await api.get<number>(`/comments/${id}/like/count`);
  return response.data;
};

// 답글 목록 조회
export const getReplies = async (commentId: string): Promise<Comment[]> => {
  const response = await api.get<Comment[]>(`/comments/${commentId}/replies`);
  return response.data;
}; 