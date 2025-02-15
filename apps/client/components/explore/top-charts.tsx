"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import { Track } from "@/types/album";
import { usePlayerStore } from "@/lib/store/player-store";
import { IconPlayerPlay } from "@tabler/icons-react";
import Image from "next/image";
import { cn, getImageUrl } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useAuth } from "@/context/auth-context";
import { Playlist } from "@/types/playlist";
import { useToast } from "../ui/toast";
import { addTrackToPlaylist, getUserPlaylists } from "@/lib/api/playlist";
import { TrackActions } from "../track/track-actions";
import { AddToPlaylistModal } from "../playlist/add-to-playlist-modal";

interface ChartTrack extends Track {
  realtimePlays: number;
  realtimeLikes: number;
  score: number;
  previousRank?: number;
}

const convertToTrack = (track: ChartTrack): Track => ({
  id: track.id,
  title: track.title,
  albumId: track.album.id,
  artistId: track.album.artist.id,
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
  duration: track.duration,
  audioUrl: track.audioUrl,
  plays: track.plays,
  order: 0,
  lyrics: track.lyrics,
  description: track.description,
  credit: track.credit,
});

export function TopCharts() {
  const { user } = useAuth();
  const [myPlaylists, setMyPlaylists] = useState<Playlist[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [isAddToPlaylistOpen, setIsAddToPlaylistOpen] = useState(false);
  const { showToast } = useToast();

  const [tracks, setTracks] = useState<ChartTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [displayCount, setDisplayCount] = useState(10);
  const { play } = usePlayerStore();
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

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

  useEffect(() => {
    const fetchCharts = async () => {
      try {
        const { data } = await api.get("/tracks/charts/realtime");
        setTracks(data);
        
        // 마지막 업데이트 시간 표시 추가
        setLastUpdated(new Date());
      } catch (error) {
        console.error("Failed to fetch charts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCharts();
    // 5분마다 차트 갱신
    const interval = setInterval(fetchCharts, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-24 bg-white/5 animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 마지막 업데이트 시간 표시 */}
      {lastUpdated && (
        <div className="text-xs text-white/40 text-right">
          마지막 업데이트: {lastUpdated.toLocaleTimeString()}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {tracks.slice(0, displayCount).map((track, index) => (
          <motion.div
            key={track.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <div className={cn(
              "group relative overflow-hidden bg-white/[0.03] hover:bg-white/[0.07] backdrop-blur-xl rounded-lg p-3 transition-all duration-300",
              "border border-white/[0.05]"
            )}>
              <div className="flex gap-3">
                {/* Rank & Change Indicator */}
                <div className="flex flex-col items-center justify-center w-12">
                  <div className="text-lg font-semibold">#{index + 1}</div>
                  {track.previousRank !== undefined && (
                    <div className="text-xs mt-1">
                      {track.previousRank > index + 1 ? (
                        <span className="text-green-400 flex items-center">
                          <span className="mr-0.5">↑</span>
                          {track.previousRank - (index + 1)}
                        </span>
                      ) : track.previousRank < index + 1 ? (
                        <span className="text-red-400 flex items-center">
                          <span className="mr-0.5">↓</span>
                          {index + 1 - track.previousRank}
                        </span>
                      ) : (
                        <span className="text-white/40">-</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Album Cover */}
                <div className="relative w-12 h-12 flex-shrink-0">
                  <Image
                    src={getImageUrl(track.album.coverImage)}
                    alt={track.title}
                    fill
                    className="object-cover transition-transform duration-300 
                      group-hover:scale-110"
                  />
                </div>

                {/* Track Info */}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-white/90 truncate">
                    {track.title}
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Link
                      href={`/album/${track.album.id}`}
                      className="text-white/60 hover:text-white/80 truncate"
                    >
                      {track.album.title}
                    </Link>
                    <span className="text-white/40">•</span>
                    <Link
                      href={`/${track.album.artist.id}`}
                      className="text-white/60 hover:text-white/80 truncate"
                    >
                      {track.album.artist.name}
                    </Link>
                    <span className="text-white/40">|</span>
                    <div className="flex items-center gap-2 text-white/40">
                      <span>{`${track.realtimePlays.toLocaleString()} plays`}</span>
                      <span>•</span>
                      <span>{`${track.realtimeLikes.toLocaleString()} likes`}</span>
                    </div>
                  </div>
                </div>

                {/* Actions Container */}
                <div className="flex items-center gap-2">
                  {/* Play Button */}
                  <button
                    onClick={() => play(track as Track, tracks)}
                    className="self-center opacity-0 group-hover:opacity-100 
                      transition-opacity duration-300"
                  >
                    <IconPlayerPlay className="w-5 h-5" />
                  </button>

                  {/* TrackActions 버튼 */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <TrackActions track={convertToTrack(track)} onAddToPlaylist={handleTrackAction} />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {displayCount < tracks.length && (
        <div className="flex justify-center pt-4">
          <Button
            variant="ghost"
            onClick={() =>
              setDisplayCount((prev) => Math.min(prev + 10, tracks.length))
            }
            className="text-white/60 hover:text-white hover:bg-white/10"
          >
            더 보기
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
