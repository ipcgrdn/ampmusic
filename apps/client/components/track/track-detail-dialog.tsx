"use client";

import { Track } from "@/types/album";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IconFileText, IconInfoCircle, IconMicrophone, IconUser } from "@tabler/icons-react";

interface TrackDetailDialogProps {
  track: Track;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TrackDetailDialog({ track, open, onOpenChange }: TrackDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-black/40 border-white/10 backdrop-blur-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 rounded-lg pointer-events-none" />
        
        <DialogHeader className="relative space-y-1">
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            {track.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="relative space-y-6 py-6">
          {/* 트랙 설명 */}
          {track.description && (
            <div className="space-y-3 p-4 rounded-lg bg-white/5 hover:bg-white/[0.07] transition-colors border border-white/10">
              <div className="flex items-center gap-2 text-sm font-medium text-white/80">
                <IconFileText className="w-4 h-4" />
                <span>소개</span>
              </div>
              <p className="text-white/70 whitespace-pre-wrap text-sm leading-relaxed">
                {track.description}
              </p>
            </div>
          )}

          {/* 가사 */}
          {track.lyrics && (
            <div className="space-y-3 p-4 rounded-lg bg-white/5 hover:bg-white/[0.07] transition-colors border border-white/10">
              <div className="flex items-center gap-2 text-sm font-medium text-white/80">
                <IconMicrophone className="w-4 h-4" />
                <span>가사</span>
              </div>
              <div className="space-y-2">
                <p className="text-white/70 whitespace-pre-wrap text-sm leading-relaxed">
                  {track.lyrics}
                </p>
              </div>
            </div>
          )}

          {/* 크레딧 */}
          {track.credit && (
            <div className="space-y-3 p-4 rounded-lg bg-white/5 hover:bg-white/[0.07] transition-colors border border-white/10">
              <div className="flex items-center gap-2 text-sm font-medium text-white/80">
                <IconUser className="w-4 h-4" />
                <span>크레딧</span>
              </div>
              <p className="text-white/70 text-sm leading-relaxed">
                {track.credit}
              </p>
            </div>
          )}

          {!track.credit && !track.lyrics && !track.description && (
            <div className="flex flex-col items-center justify-center h-full gap-2">
              <IconInfoCircle className="w-4 h-4 text-white/60" />
              <p className="text-sm text-white/60">상세 정보가 없습니다.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 