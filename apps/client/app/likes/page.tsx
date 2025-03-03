"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { likeApi } from "@/lib/api/like";
import { TrackList } from "@/components/track/track-list";
import {
  IconMusic,
  IconHeart,
  IconDisc,
  IconPlaylist,
} from "@tabler/icons-react";
import { PageTransition } from "@/components/ui/page-transition";
import { Album, Track } from "@/types/album";
import { Playlist } from "@/types/playlist";
import { useToast } from "@/components/ui/toast";
import { Loading } from "@/components/ui/loading";
import { AlbumCard } from "@/components/album/album-card";
import { PlaylistCard } from "@/components/playlist/playlist-card";
import { usePlayerStore } from "@/lib/store/player-store";
import { AddToPlaylistModal } from "@/components/playlist/add-to-playlist-modal";
import { addTrackToPlaylist, getUserPlaylists } from "@/lib/api/playlist";

const tabs = [
  { value: "tracks", label: "트랙", icon: IconMusic },
  { value: "albums", label: "앨범", icon: IconDisc },
  { value: "playlists", label: "플레이리스트", icon: IconPlaylist },
] as const;

type TabValue = typeof tabs[number]['value'];

export default function LikesPage() {
  const [selectedTab, setSelectedTab] = useState<TabValue>("tracks");
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [likedItems, setLikedItems] = useState<{
    tracks: Track[];
    albums: Album[];
    playlists: Playlist[];
  }>({
    tracks: [],
    albums: [],
    playlists: [],
  });
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [isAddToPlaylistOpen, setIsAddToPlaylistOpen] = useState(false);
  const [userPlaylists, setUserPlaylists] = useState<Playlist[]>([]);
  const [isMounted, setIsMounted] = useState(true);
  const { play } = usePlayerStore();

  useEffect(() => {
    setIsMounted(true);

    const fetchData = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        
        const [likesData, playlistsData] = await Promise.all([
          likeApi.getUserLikes(user.id),
          getUserPlaylists(user.id)
        ]);

        if (!isMounted) return;

        setLikedItems({
          tracks: likesData.tracks,
          albums: likesData.albums,
          playlists: likesData.playlists
        });

        setUserPlaylists(playlistsData || []);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        if (isMounted) {
          showToast("데이터를 불러오는데 실패했습니다.", "error");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      setIsMounted(false);
    };
  }, [user, showToast, isMounted]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
    }
  }, [user, authLoading, router]);

  const handlePlay = async (track: Track) => {
    try {
      if (!track) {
        showToast("재생할 트랙을 찾을 수 없습니다.", "error");
        return;
      }

      const trackList = likedItems.tracks || [];
      const trackIndex = trackList.findIndex((t) => t.id === track.id);
      
      if (trackIndex === -1) {
        showToast("재생 목록에서 트랙을 찾을 수 없습니다.", "error");
        return;
      }

      play(track, trackList);
    } catch (error) {
      console.error("Failed to play track:", error);
      showToast("트랙 재생에 실패했습니다.", "error");
    }
  };

  const handleAddToPlaylist = async (playlistId: string) => {
    if (!selectedTrack || !playlistId) {
      showToast("트랙 또는 플레이리스트 정보가 없습니다.", "error");
      return;
    }

    try {
      await addTrackToPlaylist(playlistId, selectedTrack.id);
      showToast(`'${selectedTrack.title}'이(가) 플레이리스트에 추가되었습니다.`, "success");
      setIsAddToPlaylistOpen(false);
      setSelectedTrack(null);
    } catch (error) {
      console.error("Failed to add track to playlist:", error);
      showToast("플레이리스트에 추가하지 못했습니다.", "error");
    }
  };

  const handleTrackAction = (track: Track) => {
    setSelectedTrack(track);
    setIsAddToPlaylistOpen(true);
  };

  const handleTabChange = (value: TabValue) => {
    setSelectedTab(value);
  };

  const renderContent = () => {
    const isEmpty = !likedItems[`${selectedTab}`]?.length;

    if (isEmpty) {
      return (
        <div className="text-center text-sm text-white/60 py-8">
          좋아요한 {tabs.find(tab => tab.value === selectedTab)?.label}이(가) 없습니다.
        </div>
      );
    }

    switch (selectedTab) {
      case "tracks":
        return (
          <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-md">
            <TrackList
              tracks={likedItems.tracks}
              showArtist
              showAlbum
              onPlay={handlePlay}
              onAddToPlaylist={handleTrackAction}
            />
          </div>
        );
      
      case "albums":
        return (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {likedItems.albums.map((album) => (
              <AlbumCard 
                key={album.id} 
                album={album} 
              />
            ))}
          </div>
        );
      
      case "playlists":
        return (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {likedItems.playlists.map((playlist) => (
              <PlaylistCard 
                key={playlist.id} 
                playlist={playlist} 
              />
            ))}
          </div>
        );
    }
  };

  if (authLoading || isLoading) return <Loading />;
  if (!user) return null;

  return (
    <PageTransition>
      <div className="min-h-screen w-full space-y-8 p-4 lg:p-8">
        {/* 헤더 섹션 */}
        <div className="relative overflow-hidden rounded-2xl p-8 backdrop-blur-lg transition-all duration-300">
          <div className="absolute inset-0 backdrop-blur-xl" />
          <div className="relative flex items-center gap-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md">
              <IconHeart className="h-10 w-10 text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">좋아요 목록</h1>
              <p className="mt-1 text-sm text-white/60">
                트랙 {likedItems?.tracks?.length || 0} · 앨범{" "}
                {likedItems?.albums?.length || 0} · 플레이리스트{" "}
                {likedItems?.playlists?.length || 0}
              </p>
            </div>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="sticky top-0 z-10 -mt-4 backdrop-blur-xl">
          <div className="mx-auto max-w-md rounded-2xl border border-white/10 bg-white/5 p-1">
            <div className="relative grid grid-cols-3 gap-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.value}
                    onClick={() => handleTabChange(tab.value)}
                    className={`flex items-center justify-center gap-2 rounded-xl border border-transparent py-2 text-sm font-medium transition-all duration-300
                      ${
                        selectedTab === tab.value
                          ? "bg-white/10 shadow-lg backdrop-blur-xl border-white/20"
                          : "hover:bg-white/5"
                      }`}
                  >
                    <Icon size={16} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 컨텐츠 영역 */}
        <div className="w-full space-y-4">
          {renderContent()}
        </div>

        {/* 플레이리스트에 추가 모달 */}
        {selectedTrack && (
          <AddToPlaylistModal
            track={selectedTrack}
            isOpen={isAddToPlaylistOpen}
            onClose={() => setIsAddToPlaylistOpen(false)}
            playlists={userPlaylists}
            onAddToPlaylist={handleAddToPlaylist}
          />
        )}
      </div>
    </PageTransition>
  );
}
