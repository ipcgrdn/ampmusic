import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { PlaylistTrackInfo } from "@/types/playlist";
import Image from "next/image";
import { formatTime, getImageUrl } from "@/lib/utils";
import { PlayCircle } from "lucide-react";
import Link from "next/link";
import { TrackActions } from "./track-actions";
import { LikeButton } from "@/components/common/LikeButton";
import { IconHeadphones } from "@tabler/icons-react";

interface SortableTrackItemProps {
  track: PlaylistTrackInfo;
  onPlay?: (track: PlaylistTrackInfo) => void;
  showArtist?: boolean;
  showAlbum?: boolean;
  onAddToPlaylist?: (track: PlaylistTrackInfo) => void;
  onRemoveFromPlaylist?: (playlistTrackId: string) => void;
  showRemove?: boolean;
}

export function SortableTrackItem({
  track,
  onPlay,
  showArtist = true,
  showAlbum = true,
  onAddToPlaylist,
  onRemoveFromPlaylist,
  showRemove = false,
}: SortableTrackItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: track.playlistTrackId! });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "grid grid-cols-[24px_48px_1fr_auto] md:grid-cols-[24px_48px_1fr_200px_200px_120px]",
        "px-4 py-3 hover:bg-white/[0.04] transition-colors items-center group",
        isDragging && "opacity-50 bg-white/[0.08]"
      )}
    >
      <div {...attributes} {...listeners} className="cursor-grab">
        <GripVertical className="w-4 h-4 text-white/40 hover:text-white" />
      </div>

      {/* Track Number & Play Button */}
      <div className="flex justify-center">
        <span className="w-8 text-center text-sm text-white/40 group-hover:hidden">
          {track.position}
        </span>
        <PlayCircle
          className="w-4 h-4 hidden group-hover:block text-white mx-auto"
          onClick={() => onPlay?.(track)}
        />
      </div>

      {/* Title & Album Cover */}
      <div className="flex items-center gap-4 min-w-0 pr-4">
        {track.album?.coverImage && (
          <div
            className="relative w-10 h-10 shrink-0 rounded-md overflow-hidden 
                    shadow-lg transition-transform group-hover:shadow-xl"
          >
            <Image
              src={getImageUrl(track.album.coverImage)}
              alt={track.album.title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
          </div>
        )}
        <div className="truncate">
          <div className="font-medium text-white/90 truncate group-hover:text-white">
            {track.title}
          </div>
          {showArtist && track.artist && (
            <div
              className="text-sm text-white/50 truncate md:hidden 
                      group-hover:text-white/60 transition-colors"
            >
              <Link
                href={`/${track.album.id}`}
                className="hover:underline text-xs"
              >
                {track.album.title}
              </Link>
              <span className="text-white/40"> • </span>
              <Link
                href={`/${track.artist.id}`}
                className="hover:underline text-xs"
              >
                {track.artist.name}
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Artist */}
      {showArtist && track.artist && (
        <div
          className="hidden md:block text-white/50 truncate hover:text-white/80 
                  transition-colors"
        >
          <Link
            href={`/${track.artist.id}`}
            className="hover:underline text-sm"
          >
            {track.artist.name}
          </Link>
        </div>
      )}

      {/* Album */}
      {showAlbum && track.album && (
        <div
          className="hidden md:block text-white/50 truncate hover:text-white/80 
                  transition-colors"
        >
          <Link
            href={`/album/${track.album.id}`}
            className="hover:underline text-sm"
          >
            {track.album.title}
          </Link>
        </div>
      )}

      {/* Duration & Actions */}
      <div className="flex items-center gap-4">
        <div
          className="text-white/40 text-sm flex items-center gap-2 min-w-[100px] 
                  justify-end"
        >
          <span className="group-hover:text-white/60 transition-colors">
            {formatTime(track.duration)}
          </span>

          <div className="pl-4">
            <LikeButton
              type="track"
              id={track.id}
              className="w-8 h-8"
              showCount={true}
            />
          </div>

          <div className="pl-4 flex items-center gap-4">
            <IconHeadphones size={16} className="text-white/40" />
            <span className="text-white/40 text-xs">
              {track.plays?.toLocaleString() || 0}
            </span>
          </div>

          {onAddToPlaylist && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity pl-4">
              <TrackActions
                track={track}
                onAddToPlaylist={onAddToPlaylist}
                onRemoveFromPlaylist={onRemoveFromPlaylist}
                showRemove={showRemove}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
