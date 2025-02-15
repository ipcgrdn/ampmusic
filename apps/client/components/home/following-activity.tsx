"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { IconPlayerPlay, IconChevronDown } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { usePlayerStore } from "@/lib/store/player-store";
import { Track } from "@/types/album";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { TrackActions } from "@/components/track/track-actions";
import { AddToPlaylistModal } from "../playlist/add-to-playlist-modal";
import { addTrackToPlaylist, getUserPlaylists } from "@/lib/api/playlist";
import { Playlist } from "@/types/playlist";
import { useToast } from "../ui/toast";
import { useAuth } from "@/context/auth-context";

interface Activity {
  id: string;
  type: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatar: string;
  };
  track: {
    id: string;
    title: string;
    trackUrl: string;
    description: string;
    credit: string;
    lyrics: string;
    album: {
      id: string;
      title: string;
      coverImage: string;
      artist: {
        id: string;
        name: string;
      };
    };
  };
}

const convertToTrack = (activity: Activity): Track => ({
  id: activity.track.id,
  title: activity.track.title,
  albumId: activity.track.album.id,
  artistId: activity.track.album.artist.id,
  album: {
    id: activity.track.album.id,
    title: activity.track.album.title,
    coverImage: activity.track.album.coverImage,
    artist: {
      id: activity.track.album.artist.id,
      name: activity.track.album.artist.name,
      email: '',
      image: '',
    },
    description: '',
    releaseDate: '',
    artistId: '',
    tracks: [],
  },
  artist: {
    id: activity.track.album.artist.id,
    name: activity.track.album.artist.name,
    email: '',
    image: '',
  },
  duration: 0,
  audioUrl: activity.track.trackUrl,
  plays: 0,
  order: 0,
  lyrics: activity.track.lyrics,
  description: activity.track.description,
  credit: activity.track.credit,
});

export function FollowingActivity() {
  const { user } = useAuth();
  const [myPlaylists, setMyPlaylists] = useState<Playlist[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [isAddToPlaylistOpen, setIsAddToPlaylistOpen] = useState(false);
  const { showToast } = useToast();
  const [visibleCount, setVisibleCount] = useState(5);
  const { play } = usePlayerStore();

  const { data: activities, isLoading } = useQuery<Activity[]>({
    queryKey: ["following-activity"],
    queryFn: async () => {
      const { data } = await api.get("/users/following/activity");
      return data;
    },
  });

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
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-24 rounded-2xl bg-white/[0.02] animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!activities?.length) {
    return (
      <div className="text-center py-12">
        <p className="text-white/60">팔로우한 유저들의 활동이 없습니다</p>
        <p className="text-sm text-white/40 mt-1">
          다른 유저들을 팔로우하고 그들의 음악 취향을 발견해보세요
        </p>
      </div>
    );
  }

  const visibleActivities = activities.slice(0, visibleCount);
  const hasMore = visibleCount < activities.length;

  const handlePlay = (activity: Activity) => {
    const track: Track = {
      id: activity.track.id,
      title: activity.track.title,
      albumId: activity.track.album.id,
      artistId: activity.track.album.artist.id,
      album: {
        id: activity.track.album.id,
        title: activity.track.album.title,
        coverImage: activity.track.album.coverImage,
        artist: {
          id: activity.track.album.artist.id,
          name: activity.track.album.artist.name,
          email: '',
          image: '',
        },
        description: '',
        releaseDate: '',
        artistId: activity.track.album.artist.id,
        tracks: [],
      },
      artist: {
        id: activity.track.album.artist.id,
        name: activity.track.album.artist.name,
        email: '',
        image: '',
      },
      duration: 0,
      audioUrl: activity.track.trackUrl,
      plays: 0,
      order: 0,
      description: '',
      lyrics: activity.track.lyrics,
      credit: '',
    };
    play(track);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleActivities.map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <div className="group relative">
              <div className={cn(
                "h-full",
                "bg-gradient-to-br from-white/[0.03] to-white/[0.01]",
                "hover:from-white/[0.05] hover:to-white/[0.02]",
                "border border-white/10 hover:border-white/20",
                "rounded-2xl transition-all duration-300"
              )}>
                <div className="flex flex-col p-3">
                  {/* User Info Section */}
                  <div className="flex items-center gap-2 mb-3">
                    <Link href={`/${activity.user.id}`} className="shrink-0">
                      <Avatar className="h-8 w-8 ring-1 ring-white/10">
                        <AvatarImage src={activity.user.avatar} />
                        <AvatarFallback>{activity.user.name[0]}</AvatarFallback>
                      </Avatar>
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/${activity.user.id}`}
                        className="text-sm hover:underline inline-block"
                      >
                        {activity.user.name}
                      </Link>
                      <p className="text-xs text-white/60">
                        {formatDistanceToNow(new Date(activity.createdAt), {
                          addSuffix: true,
                          locale: ko,
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Track Info Section */}
                  <div className={cn(
                    "flex items-center gap-3 p-2",
                    "bg-black/20 backdrop-blur-sm rounded-xl"
                  )}>
                    <div className="relative w-16 h-16 shrink-0">
                      <Image
                        src={`${process.env.NEXT_PUBLIC_API_URL}${activity.track.album.coverImage}`}
                        alt={activity.track.album.title}
                        fill
                        className="rounded-lg shadow-lg object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {activity.track.title}
                      </div>
                      <div className="text-xs text-white/60 truncate mt-0.5">
                        {activity.track.album.artist.name}
                      </div>
                    </div>
                    <button
                      onClick={() => handlePlay(activity)}
                      className={cn(
                        "p-2 rounded-full",
                        "bg-black/40 hover:bg-black/60",
                        "backdrop-blur-sm",
                        "transition-all duration-300",
                        "group-hover:scale-105",
                        "border border-white/10"
                      )}
                    >
                      <IconPlayerPlay className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* TrackActions 추가 */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <TrackActions track={convertToTrack(activity)} onAddToPlaylist={handleTrackAction} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setVisibleCount(prev => prev + 6)}
            className={cn(
              "group px-4 py-2",
              "text-sm text-white/60 hover:text-white",
              "bg-white/5 hover:bg-white/10",
              "rounded-full transition-all duration-300"
            )}
          >
            더보기
            <IconChevronDown 
              className="w-4 h-4 ml-1 transition-transform group-hover:translate-y-0.5" 
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