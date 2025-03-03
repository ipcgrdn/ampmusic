"use client";

import { Album, Track } from "@/types/album";
import { Playlist } from "@/types/playlist";
import { User } from "@/types/auth";
import { TrackCard } from "@/components/track/track-card";
import { AlbumCard } from "@/components/album/album-card";
import { PlaylistCard } from "@/components/playlist/playlist-card";
import { ArtistCard } from "../artist/artist-card";
import {
  IconMusic,
  IconDisc,
  IconPlaylist,
  IconUser,
  IconSearch,
} from "@tabler/icons-react";

interface SearchPageResultsProps {
  pages: {
    tracks: Track[];
    albums: Album[];
    playlists: Playlist[];
    users: User[];
  };
}

export function SearchPageResults({ pages }: SearchPageResultsProps) {
  // 데이터가 없는 경우 일찍 반환
  if (!pages) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-white/60">검색 결과가 없습니다</div>
      </div>
    );
  }

  const { tracks = [], albums = [], playlists = [], users = [] } = pages;

  const hasResults =
    tracks.length > 0 ||
    albums.length > 0 ||
    playlists.length > 0 ||
    users.length > 0;

  if (!hasResults) {
    return (
      <div className="flex items-center justify-center py-20 flex-col gap-4">
        <IconSearch className="w-10 h-10 text-white/60" />
        <div className="text-white/60">검색 결과가 없습니다</div>
      </div>
    );
  }

  return (
    <div className="space-y-12 relative">
      {/* 트랙 결과 */}
      {tracks.length > 0 && (
        <section
          className="backdrop-blur-xl bg-black/40 border border-white/[0.03] rounded-2xl p-6 
          transition-all duration-300 hover:bg-black/50"
        >
          <h2 className="text-xl font-semibold mb-6 text-white flex items-center gap-3">
            <IconMusic className="w-5 h-5 text-purple-400" />
            <span className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
              트랙
            </span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tracks.map((track) => (
              <TrackCard key={track.id} track={track} />
            ))}
          </div>
        </section>
      )}

      {/* 앨범 결과 */}
      {albums.length > 0 && (
        <section
          className="backdrop-blur-xl bg-black/40 border border-white/[0.03] rounded-2xl p-6 
          transition-all duration-300 hover:bg-black/50"
        >
          <h2 className="text-xl font-semibold mb-6 text-white flex items-center gap-3">
            <IconDisc className="w-5 h-5 text-purple-400" />
            <span className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
              앨범
            </span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {albums.map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>
        </section>
      )}

      {/* 플레이리스트 결과 */}
      {playlists.length > 0 && (
        <section
          className="backdrop-blur-xl bg-black/40 border border-white/[0.03] rounded-2xl p-6 
          transition-all duration-300 hover:bg-black/50"
        >
          <h2 className="text-xl font-semibold mb-6 text-white flex items-center gap-3">
            <IconPlaylist className="w-5 h-5 text-purple-400" />
            <span className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
              플레이리스트
            </span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {playlists.map((playlist) => (
              <PlaylistCard key={playlist.id} playlist={playlist} />
            ))}
          </div>
        </section>
      )}

      {/* 아티스트 결과 */}
      {users.length > 0 && (
        <section
          className="backdrop-blur-xl bg-black/40 border border-white/[0.03] rounded-2xl p-6 
          transition-all duration-300 hover:bg-black/50"
        >
          <h2 className="text-xl font-semibold mb-6 text-white flex items-center gap-3">
            <IconUser className="w-5 h-5 text-purple-400" />
            <span className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
              아티스트
            </span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {users.map((user) => (
              <ArtistCard key={user.id} artist={user} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
