import { api } from '@/lib/axios';
import { Album, CreateAlbumDto } from '@/types/album';
import { AxiosError } from 'axios';
import { Track } from '@/types/album';

export async function createAlbum(data: CreateAlbumDto): Promise<Album> {
  const response = await api.post<Album>('/albums', data);
  return response.data;
}

export async function getAlbum(id: string): Promise<Album> {
  const response = await api.get<Album>(`/albums/${id}`);
  return response.data;
}

export async function getAlbums(): Promise<Album[]> {
  const response = await api.get<Album[]>('/albums');
  return response.data;
}

export async function uploadImage(file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post<{ url: string }>('/albums/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}

export async function uploadAudio(file: File): Promise<{ url: string; duration: number }> {
  console.log('Starting audio upload for file:', {
    name: file.name,
    type: file.type,
    size: file.size
  });

  const formData = new FormData();
  formData.append("file", file);

  try {
    console.log('Sending audio upload request...');
    const response = await api.post<{ url: string; duration: number }>('/albums/upload/audio', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log('Audio upload response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Audio upload error details:', {
      error,
      status: (error as AxiosError).response?.status,
      statusText: (error as AxiosError).response?.statusText,
      data: (error as AxiosError).response?.data
    });
    throw new Error('오디오 파일 업로드에 실패했습니다');
  }
}

export async function getUserAlbums(userId: string): Promise<Album[]> {
  const response = await api.get<Album[]>(`/albums/user/${userId}`);
  return response.data;
}

export async function getUserTracks(userId: string): Promise<Track[]> {
  const response = await api.get<Track[]>(`/albums/user/${userId}/tracks`);
  return response.data;
}

export async function updateAlbum(id: string, data: Partial<CreateAlbumDto>): Promise<Album> {
  try {
    const response = await api.put<Album>(`/albums/${id}`, data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      if (error.response?.status === 403) {
        throw new Error('앨범을 수정할 권한이 없습니다');
      }
    }
    throw new Error('앨범 수정에 실패했습니다');
  }
}

export async function deleteAlbum(id: string): Promise<void> {
  try {
    await api.delete(`/albums/${id}`);
  } catch (error) {
    if (error instanceof AxiosError) {
      if (error.response?.status === 403) {
        throw new Error('앨범을 삭제할 권한이 없습니다');
      }
    }
    throw new Error('앨범 삭제에 실패했습니다');
  }
} 