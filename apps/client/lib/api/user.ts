import { api } from "../axios";

export interface User {
  id: string;
  name: string;
  avatar: string;
}

export const searchUsers = async (query: string): Promise<User[]> => {
  if (!query) return [];
  const response = await api.get<User[]>(`/users/search?q=${query}`);
  return response.data;
};

export interface FeaturedArtist {
  id: string;
  name: string;
  avatar: string;
  bio: string | null;
  metrics: {
    followers: number;
    followerGrowth: number;
    likes: number;
    likeGrowth: number;
    plays: number;
    playGrowth: number;
    score: number;
  };
  recentAlbum?: {
    id: string;
    title: string;
    coverImage: string;
    releaseDate: string;
  };
}

export const getFeaturedArtists = async (): Promise<FeaturedArtist[]> => {
  const { data } = await api.get<FeaturedArtist[]>('/users/featured');
  return data;
};

export interface FollowingUpdate {
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

export const getFollowingUpdates = async (): Promise<FollowingUpdate[]> => {
  const { data } = await api.get<FollowingUpdate[]>('/users/following/updates');
  return data;
}; 