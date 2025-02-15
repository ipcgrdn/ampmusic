import { api } from '@/lib/axios';
import { Playlist } from '@/types/playlist';
import { AxiosError } from 'axios';

export interface CreatePlaylistDto {
  title: string;
  description?: string;
  coverImage?: string;
  isPublic?: boolean;
  taggedUserIds?: string[];
}

export async function createPlaylist(data: CreatePlaylistDto): Promise<Playlist> {
  const response = await api.post<Playlist>('/playlists', data);
  return response.data;
}

export async function getPlaylist(id: string): Promise<Playlist> {
  const response = await api.get<Playlist>(`/playlists/${id}`);
  return response.data;
}

export async function getPlaylists(): Promise<Playlist[]> {
  const response = await api.get<Playlist[]>('/playlists');
  return response.data;
}

export async function uploadImage(file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post<{ url: string }>('/playlists/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}

export async function getUserPlaylists(userId: string): Promise<Playlist[]> {
  const response = await api.get<Playlist[]>(`/playlists/user/${userId}`);
  return response.data;
}

export async function updatePlaylist(id: string, data: Partial<CreatePlaylistDto>): Promise<Playlist> {
  try {
    const response = await api.put<Playlist>(`/playlists/${id}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function deletePlaylist(id: string): Promise<void> {
  try {
    await api.delete(`/playlists/${id}`);
  } catch (error) {
    if (error instanceof AxiosError) {
      if (error.response?.status === 403) {
        throw new Error('플레이리스트를 삭제할 권한이 없습니다');
      }
    }
    throw new Error('플레이리스트 삭제에 실패했습니다');
  }
}

export async function addTrackToPlaylist(playlistId: string, trackId: string): Promise<Playlist> {
  try {
    const response = await api.post<Playlist>(`/playlists/${playlistId}/tracks`, { trackId });
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      if (error.response?.status === 403) {
        throw new Error('트랙을 추가할 권한이 없습니다');
      }

    }
    throw new Error('트랙 추가에 실패했습니다');
  }
}

export async function removeTrackFromPlaylist(playlistId: string, trackId: string): Promise<void> {
  try {
    await api.delete(`/playlists/${playlistId}/tracks/${trackId}`);
  } catch (error) {
    if (error instanceof AxiosError) {
      if (error.response?.status === 403) {
        throw new Error('트랙을 제거할 권한이 없습니다');
      }
    }
    throw new Error('트랙 제거에 실패했습니다');
  }
}