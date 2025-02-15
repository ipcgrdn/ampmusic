import Link from "next/link";
import Image from "next/image";
import {
  IconMusic,
  IconUser,
  IconPlaylist,
  IconDisc,
  IconArrowRight,
  IconMoodEmpty,
} from "@tabler/icons-react";
import { Album, Track } from "@/types/album";
import { Playlist } from "@/types/playlist";
import { User } from "@/types/auth";
import { getImageUrl } from "@/lib/utils";
import { usePlayerStore } from "@/lib/store/player-store";
import { HighlightedText } from "./HighlightedText";
import { TrackActions } from "../track/track-actions";
interface SearchResultsProps {
  data: {
    albums: (Album & {
      highlight?: { title?: string; description?: string };
    })[];
    tracks: (Track & { highlight?: { title?: string } })[];
    playlists: (Playlist & {
      highlight?: { title?: string; description?: string };
    })[];
    users: (User & { highlight?: { name?: string } })[];
  };
  onClose?: () => void;
}

export function SearchResults({ data, onClose }: SearchResultsProps) {
  const { play } = usePlayerStore();

  const albums = data?.albums ?? [];
  const tracks = data?.tracks ?? [];
  const playlists = data?.playlists ?? [];
  const users = data?.users ?? [];

  const hasResults = Boolean(
    (albums?.length ?? 0) > 0 ||
      (tracks?.length ?? 0) > 0 ||
      (playlists?.length ?? 0) > 0 ||
      (users?.length ?? 0) > 0
  );

  if (!data || !hasResults) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-white/60">
        <IconMoodEmpty size={48} className="mb-4" />
        <p className="text-sm">검색 결과가 없습니다</p>
        <p className="text-xs mt-1">검색어를 다시 입력해주세요</p>
      </div>
    );
  }

  const SectionHeader = ({
    icon: Icon,
    title,
    count,
  }: {
    icon: typeof IconMusic | typeof IconPlaylist | typeof IconUser | typeof IconDisc;
    title: string;
    count: number;
  }) => (
    <div className="flex items-center justify-between mb-4">
      <h3 className="flex items-center gap-2 text-sm font-medium text-white/80">
        <Icon size={16} className="text-white/60" />
        {title}
      </h3>
      {count > 4 && (
        <Link
          href={`/search?type=${title.toLowerCase()}`}
          onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
            e.preventDefault();
            onClose?.();
            window.location.href = `/search?type=${title.toLowerCase()}`;
          }}
          className="flex items-center gap-1 text-xs text-white/50 hover:text-white/80 transition-colors"
        >
          더 많은 결과 보기
          <IconArrowRight size={12} />
        </Link>
      )}
    </div>
  );

  const handleTrackClick = (track: Track) => {
    play(track);
    onClose?.();
  };

  return (
    <div className="divide-y divide-white/10">
      {albums.length > 0 && (
        <div className="p-4">
          <SectionHeader icon={IconDisc} title="Albums" count={albums.length} />
          <div className="grid grid-cols-2 gap-3">
            {albums.slice(0, 4).map((album) => (
              <Link
                key={album.id}
                href={`/album/${album.id}`}
                onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                  e.preventDefault();
                  onClose?.();
                  window.location.href = `/album/${album.id}`;
                }}
                className="group flex items-center gap-4 p-1 rounded-xl 
                         hover:bg-white/5 transition-colors duration-200"
              >
                <div
                  className="h-10 w-10 relative flex-shrink-0 rounded-lg overflow-hidden
                              ring-1 ring-white/10 group-hover:ring-white/20 transition-all"
                >
                  <Image
                    src={getImageUrl(album.coverImage ?? "")}
                    alt={album.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <HighlightedText
                    text={album.title}
                    highlight={album.highlight?.title}
                    className="truncate text-sm font-medium group-hover:text-white/90 
                             transition-colors"
                  />
                  {album.artist && (
                    <p
                      className="truncate text-xs text-white/50 group-hover:text-white/60 
                                transition-colors"
                    >
                      {album.artist.name}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {tracks.length > 0 && (
        <div className="p-4">
          <SectionHeader
            icon={IconMusic}
            title="Tracks"
            count={tracks.length}
          />
          <div className="space-y-2">
            {tracks.slice(0, 4).map((track) => (
              <div
                key={track.id}
                onClick={() => handleTrackClick(track)}
                className="group flex items-center gap-4 p-1 rounded-xl 
                         hover:bg-white/5 transition-colors duration-200 cursor-pointer"
              >
                <div
                  className="h-10 w-10 relative flex-shrink-0 rounded-lg overflow-hidden
                              ring-1 ring-white/10 group-hover:ring-white/20 transition-all"
                >
                  <Image
                    src={getImageUrl(track.album?.coverImage ?? "")}
                    alt={track.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <HighlightedText
                    text={track.title}
                    highlight={track.highlight?.title}
                    className="truncate text-sm font-medium group-hover:text-white/90 
                             transition-colors"
                  />
                  <div className="flex items-center gap-1 text-xs text-white/50">
                    <span className="truncate">{track.artist?.name}</span>
                    {track.album && (
                      <>
                        <span className="text-white/30">•</span>
                        <span className="truncate">{track.album.title}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <TrackActions track={track} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {playlists.length > 0 && (
        <div className="p-4">
          <SectionHeader
            icon={IconPlaylist}
            title="Playlists"
            count={playlists.length}
          />
          <div className="grid grid-cols-2 gap-3">
            {playlists.slice(0, 4).map((playlist) => (
              <Link
                key={playlist.id}
                href={`/playlist/${playlist.id}`}
                onClick={onClose}
                className="group flex items-center gap-4 p-1 rounded-xl 
                         hover:bg-white/5 transition-colors duration-200"
              >
                <div
                  className="h-10 w-10 relative flex-shrink-0 rounded-lg overflow-hidden
                              ring-1 ring-white/10 group-hover:ring-white/20 transition-all"
                >
                  <Image
                    src={getImageUrl(playlist.coverImage ?? "")}
                    alt={playlist.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <HighlightedText
                    text={playlist.title}
                    highlight={playlist.highlight?.title}
                    className="truncate text-sm font-medium group-hover:text-white/90 
                             transition-colors"
                  />
                  <div className="flex items-center gap-1 text-xs text-white/50">
                    <span>By {playlist.user?.name}</span>
                    {playlist.tracks && (
                      <>
                        <span className="text-white/30">•</span>
                        <span className="truncate">
                          {playlist.tracks.length} tracks
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {users.length > 0 && (
        <div className="p-4">
          <SectionHeader icon={IconUser} title="Users" count={users.length} />
          <div className="grid grid-cols-2 gap-3">
            {users.slice(0, 4).map((user) => (
              <Link
                key={user.id}
                href={`/${user.id}`}
                onClick={onClose}
                className="group flex items-center gap-4 p-1 rounded-xl 
                         hover:bg-white/5 transition-colors duration-200"
              >
                <div
                  className="h-10 w-10 relative flex-shrink-0 rounded-lg overflow-hidden
                              ring-1 ring-white/10 group-hover:ring-white/20 transition-all"
                >
                  <Image
                    src={getImageUrl(user.avatar ?? "")}
                    alt={user.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <HighlightedText
                    text={user.name}
                    highlight={user.highlight?.name}
                    className="truncate text-sm font-medium group-hover:text-white/90 
                             transition-colors"
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
