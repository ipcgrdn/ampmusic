import { User } from "./auth";

import { Track, UserTag } from "./album";

export interface PlaylistTrack {
  id: string;
  position: number;
  track: Track;
  addedAt: string;
}

export interface Playlist {
  id: string;
  title: string;
  description?: string;
  coverImage: string;
  isPublic: boolean;
  userId: string;
  tracks: PlaylistTrack[];
  user: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
  taggedUsers?: UserTag[];
  _count: {
    tracks: number;
    likes: number;
  };
}

export interface PlaylistTrackInfo extends Track {
  playlistTrackId?: string;  // PlaylistTrack의 고유 ID
  addedAt?: string;         // 플레이리스트에 추가된 시간
  position?: number;        // 플레이리스트 내 위치
}