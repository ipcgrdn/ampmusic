"use client";

import { useQuery } from "@tanstack/react-query";
import { getSimilarUsersTracks, SimilarUsersTrack } from "@/lib/api/track";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { IconPlayerPlay, IconChevronDown } from "@tabler/icons-react";
import { cn, formatDuration } from "@/lib/utils";
import { usePlayerStore } from "@/lib/store/player-store";
import { Track } from "@/types/album";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { TrackActions } from "@/components/track/track-actions";
import { AddToPlaylistModal } from "../playlist/add-to-playlist-modal";
import { addTrackToPlaylist, getUserPlaylists } from "@/lib/api/playlist";
import { useAuth } from "@/context/auth-context";
import { Playlist } from "@/types/playlist";
import { useToast } from "../ui/toast";

const convertToTrack = (track: SimilarUsersTrack): Track => ({
  id: track.id,
  title: track.title,
  duration: track.duration,
  audioUrl: track.audioUrl,
  albumId: track.album.id,
  artistId: track.album.artist.id,
  lyrics: track.lyrics || '',
  plays: track.plays,
  album: {
    id: track.album.id,
    title: track.album.title,
    coverImage: track.album.coverImage,
    artist: {
      id: track.album.artist.id,
      name: track.album.artist.name,
      email: '',
      image: '',
    },
    description: '',
    releaseDate: '',
    artistId: '',
    tracks: [],
  },
  artist: {
    id: track.album.artist.id,
    name: track.album.artist.name,
    email: '',
    image: '',
  },
  order: 0,
  description: track.description,
  credit: track.credit,
});

export function SimilarUsersTracks() {
  const { user } = useAuth();
  const [myPlaylists, setMyPlaylists] = useState<Playlist[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [isAddToPlaylistOpen, setIsAddToPlaylistOpen] = useState(false);
  const { showToast } = useToast();
  const [visibleCount, setVisibleCount] = useState(5);
  const { data: tracks, isLoading } = useQuery({
    queryKey: ["similar-users-tracks"],
    queryFn: getSimilarUsersTracks,
  });

  const { play } = usePlayerStore();

  useEffect(() => {
    const fetchMyPlaylists = async () => {
      if (!user) return;
      try {
        const myPlaylistData = await getUserPlaylists(user.id);
        setMyPlaylists(myPlaylistData);
      } catch (error) {
        console.error("Failed to fetch my playlists:", error);
      }
    };
    fetchMyPlaylists();
  }, [user]);

  const handleAddToPlaylist = async (playlistId: string) => {
    if (!selectedTrack) return;

    try {
      await addTrackToPlaylist(playlistId, selectedTrack.id);
      showToast("트랙이 플레이리스트에 추가되었습니다.", "success");
    } catch {
      showToast("트랙 추가에 실패했습니다.", "error");
    }
  };

  const handleTrackAction = (track: Track) => {
    setSelectedTrack(track);
    setIsAddToPlaylistOpen(true);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-[180px] rounded-xl bg-white/5 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!tracks?.length) {
    return (
      <div className="text-center text-sm text-white/60 py-8">
        아직 추천할 트랙이 없습니다
      </div>
    );
  }

  const visibleTracks = tracks.slice(0, visibleCount);
  const hasMore = tracks.length > visibleCount;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleTracks.map((track, index) => (
          <motion.div
            key={track.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="group relative">
              <div
                className={cn(
                  "group relative rounded-xl bg-gradient-to-br from-white/[0.03] to-white/[0.01]",
                  "hover:from-white/[0.05] hover:to-white/[0.02]",
                  "border border-white/10 hover:border-white/20",
                  "transition-all duration-300"
                )}
              >
                <div className="relative flex gap-4 p-4">
                  <div className="relative">
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden">
                      <Image
                        src={`${process.env.NEXT_PUBLIC_API_URL}${track.album.coverImage}`}
                        alt={track.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <button
                      onClick={() => play(convertToTrack(track))}
                      className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                      <IconPlayerPlay className="w-8 h-8 text-white" />
                    </button>
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/album/${track.album.id}`}
                      className="block hover:underline"
                    >
                      <h4 className="font-medium text-white truncate">
                        {track.title}
                      </h4>
                    </Link>
                    <Link
                      href={`/${track.album.artist.id}`}
                      className="block text-sm text-white/60 hover:text-white/80 hover:underline truncate"
                    >
                      {track.album.artist.name}
                    </Link>
                    <div className="flex items-center gap-2 mt-2 text-sm text-white/40">
                      <span>{formatDuration(track.duration)}</span>
                      <span>•</span>
                      <span>{track.likedByCount}명이 좋아합니다</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <TrackActions track={convertToTrack(track)} onAddToPlaylist={handleTrackAction} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center">
          <Button
            variant="ghost"
            className="group flex items-center gap-2 text-white/60 hover:text-white"
            onClick={() => setVisibleCount(prev => prev + 6)}
          >
            더보기
            <IconChevronDown 
              className="w-4 h-4 transition-transform group-hover:translate-y-0.5" 
            />
          </Button>
        </div>
      )}
      <AddToPlaylistModal
        track={selectedTrack!}
        isOpen={isAddToPlaylistOpen}
        onClose={() => setIsAddToPlaylistOpen(false)}
        playlists={myPlaylists}
        onAddToPlaylist={handleAddToPlaylist}
      />
    </div>
  );
} 