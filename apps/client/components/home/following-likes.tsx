"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { IconPlayerPlay } from "@tabler/icons-react";
import { usePlayerStore } from "@/lib/store/player-store";
import { useEffect, useState } from "react";
import { getTrackById } from "@/lib/api/track";
import { TrackActions } from "@/components/track/track-actions";
import { AddToPlaylistModal } from "../playlist/add-to-playlist-modal";
import { useToast } from "../ui/toast";
import { Track } from "@/types/album";
import { Playlist } from "@/types/playlist";
import { useAuth } from "@/context/auth-context";
import { addTrackToPlaylist, getUserPlaylists } from "@/lib/api/playlist";
import { getImageUrl } from "@/lib/utils";

interface LikeActivity {
  id: string;
  type: "LIKE";
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
    duration: number;
    lyrics: string;
    description: string;
    credit: string;
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

const convertToTrack = (activity: LikeActivity): Track => ({
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
      email: "",
      image: "",
    },
    description: "",
    releaseDate: "",
    artistId: "",
    tracks: [],
  },
  artist: {
    id: activity.track.album.artist.id,
    name: activity.track.album.artist.name,
    email: "",
    image: "",
  },
  duration: 0,
  audioUrl: activity.track.trackUrl,
  plays: 0,
  order: 0,
  lyrics: activity.track.lyrics,
  description: activity.track.description,
  credit: activity.track.credit,
});

export function FollowingLikes() {
  const { user } = useAuth();
  const [myPlaylists, setMyPlaylists] = useState<Playlist[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [isAddToPlaylistOpen, setIsAddToPlaylistOpen] = useState(false);
  const { showToast } = useToast();

  const { play } = usePlayerStore();
  const [visibleCount, setVisibleCount] = useState(5);

  const { data: activities, isLoading } = useQuery<LikeActivity[]>({
    queryKey: ["following-likes"],
    queryFn: async () => {
      const { data } = await api.get("/users/following/likes");
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
      <div className="text-center text-sm py-12">
        <p className="text-white/60">팔로우한 유저들의 좋아요가 없습니다</p>
        <p className="text-sm text-white/40 mt-1">
          다른 유저들을 팔로우하고 그들의 음악 취향을 발견해보세요
        </p>
      </div>
    );
  }

  const handlePlay = async (activity: LikeActivity) => {
    try {
      // 트랙 상세정보 가져오기
      const trackDetails = await getTrackById(activity.track.id);

      // 트랙 재생
      play({
        ...trackDetails,
        album: {
          ...trackDetails.album,
        },
        artist: {
          id: trackDetails.album.artist.id,
          name: trackDetails.album.artist.name,
        },
      });
    } catch (error) {
      console.error("트랙 정보를 가져오는데 실패했습니다:", error);
      // 에러 처리 (예: 토스트 메시지 표시)
    }
  };

  const visibleActivities = activities?.slice(0, visibleCount);
  const hasMore = activities && visibleCount < activities.length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {visibleActivities?.map((activity) => (
          <div
            key={activity.id}
            className="group relative flex flex-col overflow-hidden rounded-xl bg-white/[0.03] 
                     backdrop-blur-sm transition-all duration-300 hover:bg-white/[0.06]
                     border border-white/[0.05]"
          >
            {/* 앨범 커버 */}
            <div className="relative aspect-square overflow-hidden">
              <Image
                src={getImageUrl(activity.track.album.coverImage)}
                alt={activity.track.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50" />

              {/* 재생 버튼 */}
              <button
                onClick={() => handlePlay(activity)}
                className="absolute bottom-3 right-3 rounded-full bg-white/10 p-2.5
                         backdrop-blur-md transition-all duration-300
                         hover:bg-white/20 group-hover:opacity-100 opacity-0"
              >
                <IconPlayerPlay className="h-5 w-5 text-white" />
              </button>
            </div>

            {/* 트랙 정보 */}
            <div className="flex flex-col gap-3 p-4">
              <div className="space-y-1.5">
                <div className="line-clamp-1 text-sm font-medium text-white">
                  {activity.track.title}
                </div>
                <div className="line-clamp-1 text-xs text-white/60">
                  {activity.track.album.artist.name}
                </div>
              </div>

              {/* 유저 정보 */}
              <div className="flex flex-col md:flex-row items-center gap-2">
                <Link href={`/${activity.user.id}`}>
                  <Avatar className="h-6 w-6 border border-white/10">
                    <AvatarImage
                      src={activity.user.avatar}
                      alt={activity.user.name}
                    />
                    <AvatarFallback>{activity.user.name[0]}</AvatarFallback>
                  </Avatar>
                </Link>
                <div className="flex items-center gap-1 text-xs">
                  <Link
                    href={`/${activity.user.id}`}
                    className="text-white/80 hover:text-white hover:underline"
                  >
                    {activity.user.name}
                  </Link>
                  <span className="text-white/40">•</span>
                  <span className="text-white/40">
                    {formatDistanceToNow(new Date(activity.createdAt), {
                      addSuffix: true,
                      locale: ko,
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* TrackActions 추가 */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <TrackActions
                track={convertToTrack(activity)}
                onAddToPlaylist={handleTrackAction}
              />
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="text-center pt-6">
          <Button
            variant="ghost"
            className="text-white/60 hover:text-white"
            onClick={() => setVisibleCount((prev) => prev + 10)}
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
