"use client";

import {
  IconDotsVertical,
  IconPlaylist,
  IconTrash,
  IconFileText,
  IconPlayerPlay,
  IconPlaylistAdd,
  IconPlayerTrackNext,
  IconAlertCircle,
} from "@tabler/icons-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Track } from "@/types/album";
import { Button } from "@/components/ui/button";
import { TrackDetailDialog } from "@/components/track/track-detail-dialog";
import { useState } from "react";
import { usePlayerStore } from "@/lib/store/player-store";
import { ReportDialog } from "./report-dialog";

interface TrackActionsProps {
  track: Track;
  onAddToPlaylist?: (track: Track) => void;
  onRemoveFromPlaylist?: (playlistTrackId: string) => void;
  showRemove?: boolean;
}

export function TrackActions({
  track,
  onAddToPlaylist,
  onRemoveFromPlaylist,
  showRemove = false,
}: TrackActionsProps) {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const { play, addToQueue, addNextToQueue } = usePlayerStore();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 p-0 text-white/70 hover:text-white hover:bg-white/10"
        >
          <IconDotsVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-48 bg-black/90 border-white/10 backdrop-blur-sm z-[9800]"
      >
        <DropdownMenuItem
          className="flex items-center gap-2 text-sm cursor-pointer text-white/80 hover:text-white focus:text-white focus:bg-white/10"
          onClick={() => play(track)}
        >
          <IconPlayerPlay className="h-4 w-4" />
          <span>재생</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          className="flex items-center gap-2 text-sm cursor-pointer text-white/80 hover:text-white focus:text-white focus:bg-white/10"
          onClick={() => addNextToQueue(track)}
        >
          <IconPlayerTrackNext className="h-4 w-4" />
          <span>다음에 재생</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          className="flex items-center gap-2 text-sm cursor-pointer text-white/80 hover:text-white focus:text-white focus:bg-white/10"
          onClick={() => addToQueue(track)}
        >
          <IconPlaylistAdd className="h-4 w-4" />
          <span>마지막에 추가</span>
        </DropdownMenuItem>

        <Separator className="my-2" />

        <DropdownMenuItem
          className="flex items-center gap-2 text-sm cursor-pointer text-white/80 hover:text-white focus:text-white focus:bg-white/10"
          onSelect={() => {
            setIsDetailOpen(true);
          }}
        >
          <IconFileText className="h-4 w-4" />
          <span>트랙 정보</span>
        </DropdownMenuItem>

        {onAddToPlaylist && (
          <DropdownMenuItem
            className="flex items-center gap-2 text-sm cursor-pointer text-white/80 hover:text-white focus:text-white focus:bg-white/10"
            onClick={() => onAddToPlaylist?.(track)}
          >
            <IconPlaylist className="h-4 w-4" />
            <span>플레이리스트에 추가</span>
          </DropdownMenuItem>
        )}

        {showRemove && onRemoveFromPlaylist && track && (
          <DropdownMenuItem
            className="flex items-center gap-2 text-sm cursor-pointer focus:bg-white/10"
            onClick={() => onRemoveFromPlaylist(track.id)}
          >
            <IconTrash className="h-4 w-4 text-red-500" />
            <span className="text-red-500">플레이리스트에서 제거</span>
          </DropdownMenuItem>
        )}

        <Separator className="my-2" />

        <DropdownMenuItem
          className="flex items-center gap-2 text-sm cursor-pointer text-white/80 hover:text-white focus:text-white focus:bg-white/10"
          onClick={() => setIsReportOpen(true)}
        >
          <IconAlertCircle className="h-4 w-4" />
          <span>신고하기</span>
        </DropdownMenuItem>
      </DropdownMenuContent>

      <TrackDetailDialog
        track={track}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />

      <ReportDialog
        type="track"
        data={track} 
        open={isReportOpen}
        onOpenChange={setIsReportOpen}
      />
    </DropdownMenu>
  );
}
