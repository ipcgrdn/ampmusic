"use client";

import { useState } from "react";
import { Track } from "@/types/album";
import { Playlist } from "@/types/playlist";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { IconPlaylist } from "@tabler/icons-react";
import { getImageUrl } from "@/lib/utils";
import Image from "next/image";

interface AddToPlaylistModalProps {
  track: Track;
  isOpen: boolean;
  onClose: () => void;
  playlists?: Playlist[];
  onAddToPlaylist: (playlistId: string) => Promise<void>;
}

export function AddToPlaylistModal({
  isOpen,
  onClose,
  playlists = [],
  onAddToPlaylist,
}: AddToPlaylistModalProps) {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleAddToPlaylist = async (playlistId: string) => {
    try {
      setIsLoading(true);
      await onAddToPlaylist(playlistId);
      onClose();
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "트랙 추가에 실패했습니다.",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-black/90 border-white/10 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            플레이리스트에 추가
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-2">
          {playlists.length === 0 ? (
            <div className="text-center py-8 text-white/60">
              <IconPlaylist className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>플레이리스트가 없습니다.</p>
              <p className="text-sm">새로운 플레이리스트를 만들어보세요!</p>
            </div>
          ) : (
            playlists.map((playlist, index) => (
              <button
                key={`playlist-${playlist.id}-${index}`}
                onClick={() => handleAddToPlaylist(playlist.id)}
                disabled={isLoading}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 
                  transition-colors text-left group disabled:opacity-50"
              >
                <div className="w-12 h-12 bg-white/5 rounded-md overflow-hidden">
                  {playlist.coverImage ? (
                    <Image
                      src={getImageUrl(playlist.coverImage)}
                      alt={playlist.title}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-white/5">
                      <IconPlaylist className="w-6 h-6 text-white/40" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-white/90 group-hover:text-white">
                    {playlist.title}
                  </h3>
                  <p className="text-sm text-white/50">
                    {playlist.tracks?.length || 0}곡
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
