import { Album, Track, User, Playlist } from '@prisma/client';

interface Highlight {
  title?: string;
  description?: string;
  name?: string;
}

interface SearchItem {
  highlight?: Highlight;
}

export interface SearchResponse {
  albums: (Album & SearchItem)[];
  tracks: (Track & SearchItem)[];
  playlists: (Playlist & SearchItem)[];
  users: (User & SearchItem)[];
} 