import { Playlist } from "./playlist";

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
}

export interface Track {
  id: string;
  title: string;
  duration: number;
  audioUrl: string;
  order: number;
  albumId: string;
  artistId: string;
  description?: string;
  lyrics: string;
  credit?: string;
  plays: number;
  // Relations
  album: Album;
  artist: User;
}

export interface UserTag {
  id: string;
  user: User;
  userId: string;
  createdAt: string;
  albumId?: string;
  album?: Album;
  playlistId?: string;
  playlist?: Playlist;
}

export interface Album {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  releaseDate: string;
  artistId: string;
  taggedUsers?: UserTag[];
  // Relations
  artist: User;
  tracks: Track[];
}

export interface CreateAlbumDto {
  title: string;
  description?: string;
  coverImage?: string;
  releaseDate: string;
  artistId: string;
  tracks: {
    title: string;
    duration: number;
    audioUrl: string;
    order: number;
  }[];
  taggedUserIds?: string[];
} 