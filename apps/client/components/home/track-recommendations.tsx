"use client";

import { useQuery } from "@tanstack/react-query";
import { getRecommendations, TrackRecommendation } from "@/lib/api/track";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { IconPlayerPlay } from "@tabler/icons-react";
import { cn, formatDuration, getImageUrl } from "@/lib/utils";
import { usePlayerStore } from "@/lib/store/player-store";
import { Track } from "@/types/album";
import { TrackActions } from "@/components/track/track-actions";
import { AddToPlaylistModal } from "../playlist/add-to-playlist-modal";
import { addTrackToPlaylist, getUserPlaylists } from "@/lib/api/playlist";
import { useEffect, useState } from "react";
import { Playlist } from "@/types/playlist";
import { useAuth } from "@/context/auth-context";
import { useToast } from "../ui/toast";

const recommendationColors = {
  ARTIST: "from-emerald-500/20",
  FOLLOW: "from-blue-500/20",
  SIMILAR: "from-purple-500/20",
  POPULAR: "from-amber-500/20",
} as const;

const recommendationIcons = {
  ARTIST: "🎵",
  FOLLOW: "👥",
  SIMILAR: "✨",
  POPULAR: "🔥",
} as const;

// TrackRecommendation을 Track으로 변환하는 함수
const convertToTrack = (recommendation: TrackRecommendation): Track => ({
  id: recommendation.id,
  title: recommendation.title,
  duration: recommendation.duration,
  audioUrl: recommendation.audioUrl,
  albumId: recommendation.album.id,
  artistId: recommendation.album.artist.id,
  plays: recommendation.plays,
  album: {
    id: recommendation.album.id,
    title: recommendation.album.title,
    coverImage: recommendation.album.coverImage,
    artist: {
      id: recommendation.album.artist.id,
      name: recommendation.album.artist.name,
      email: "",
      image: "",
    },
    description: "",
    releaseDate: "",
    artistId: "",
    tracks: [],
  },
  artist: {
    id: recommendation.album.artist.id,
    name: recommendation.album.artist.name,
    email: "",
    image: "",
  },
  order: 0,
  description: recommendation.description,
  credit: recommendation.credit,
  lyrics: recommendation.lyrics,
});

export function TrackRecommendations() {
  const { user } = useAuth();
  const [myPlaylists, setMyPlaylists] = useState<Playlist[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [isAddToPlaylistOpen, setIsAddToPlaylistOpen] = useState(false);
  const { showToast } = useToast();

  const { data: recommendations, isLoading } = useQuery({
    queryKey: ["recommendations"],
    queryFn: getRecommendations,
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-[180px] rounded-xl bg-white/5 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!recommendations?.length) {
    return (
      <div className="text-center text-sm text-white/60 py-8">
        추천할 트랙이 없습니다
      </div>
    );
  }

  const groupedRecommendations = recommendations?.reduce(
    (acc, track) => {
      const type = track.recommendReason.type;
      if (!acc[type]) acc[type] = [];
      acc[type].push(track);
      return acc;
    },
    {} as Record<string, typeof recommendations>
  );

  return (
    <div className="space-y-8">
      {Object.entries(groupedRecommendations || {}).map(([type, tracks]) => (
        <div key={type} className="space-y-4">
          <h3 className="text-lg font-medium text-white/80 flex items-center gap-2">
            <span>
              {recommendationIcons[type as keyof typeof recommendationIcons]}
            </span>
            <span>{tracks[0].recommendReason.description}</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tracks.map((track, index) => (
              <motion.div
                key={track.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div
                  className={cn(
                    "group relative rounded-xl bg-gradient-to-br from-white/[0.03] to-white/[0.01]",
                    "hover:from-white/[0.05] hover:to-white/[0.02]",
                    "border border-white/10 hover:border-white/20",
                    "transition-all duration-300"
                  )}
                >
                  <div
                    className={cn(
                      "absolute inset-0 rounded-xl bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                      recommendationColors[
                        track.recommendReason
                          .type as keyof typeof recommendationColors
                      ]
                    )}
                  />
                  <div className="relative flex gap-4 p-4">
                    <div className="relative">
                      <div className="relative w-12 h-12 md:w-24 md:h-24 rounded-lg overflow-hidden">
                        <Image
                          src={getImageUrl(track.album.coverImage)}
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
                      <div className="flex items-start justify-between">
                        <div className="min-w-0">
                          <h4 className="font-medium text-white truncate">
                            {track.title}
                          </h4>
                          <Link
                            href={`/${track.album.artist.id}`}
                            className="text-sm text-white/60 hover:text-white/80 transition-colors"
                          >
                            {track.album.artist.name}
                          </Link>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <TrackActions
                            track={convertToTrack(track)}
                            onAddToPlaylist={handleTrackAction}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-4 text-sm text-white/40">
                        <span>
                          {formatDuration(track.duration)}
                        </span>
                        <span>•</span>
                        <span>{track.plays}회 재생</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
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
