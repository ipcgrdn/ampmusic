"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useToast } from "@/components/ui/toast";
import { getPlaylist } from "@/lib/api/playlist";
import { Playlist, PlaylistTrackInfo } from "@/types/playlist";
import { formatTime } from "@/lib/utils";
import { PageTransition } from "@/components/ui/page-transition";
import { useAuth } from "@/context/auth-context";
import { PlaylistActions } from "@/components/playlist/playlist-actions";
import { TrackList } from "@/components/track/track-list";
import { getImageUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlayCircle } from "lucide-react";
import {
  IconMusic,
  IconPlaylist,
  IconMessageCircle,
} from "@tabler/icons-react";
import { PlaylistEditForm } from "@/components/playlist/playlist-edit-form";
import { Track } from "@/types/album";
import { usePlayerStore } from "@/lib/store/player-store";
import { AddToPlaylistModal } from "@/components/playlist/add-to-playlist-modal";
import {
  getUserPlaylists,
  addTrackToPlaylist,
  removeTrackFromPlaylist,
} from "@/lib/api/playlist";
import { LikeButton } from "@/components/common/LikeButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CommentSection } from "@/components/comments/CommentSection";
import { ShareButton } from "@/components/common/ShareButton";
import { api } from "@/lib/axios";
import { TaggedUserList } from "@/components/tag/tagged-user-list";
import { User } from "@/types/auth";

export default function PlaylistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { play } = usePlayerStore();
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [isAddToPlaylistOpen, setIsAddToPlaylistOpen] = useState(false);
  const [userPlaylists, setUserPlaylists] = useState<Playlist[]>([]);

  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        const data = await getPlaylist(id);
        setPlaylist(data);
      } catch {
        showToast("플레이리스트를 불러오는데 실패했습니다.", "error");
        router.push("/");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlaylist();
  }, [id, router, showToast]);

  useEffect(() => {
    const fetchUserPlaylists = async () => {
      if (!user) return;
      try {
        const playlists = await getUserPlaylists(user.id);
        setUserPlaylists(playlists.filter((p) => p.id !== id));
      } catch (error) {
        console.error("Failed to fetch user playlists:", error);
      }
    };

    fetchUserPlaylists();
  }, [user, id]);

  if (isLoading || !playlist) {
    return <PlaylistSkeleton />;
  }

  const totalDuration = playlist.tracks.reduce(
    (total, item) => total + item.track.duration,
    0
  );

  const isOwner = user?.id === playlist.userId;

  const handlePlayAll = () => {
    if (playlist?.tracks && playlist.tracks.length > 0) {
      const firstTrackWithInfo = {
        ...playlist.tracks[0].track,
        album: {
          ...playlist.tracks[0].track.album,
          coverImage: playlist.tracks[0].track.album.coverImage,
        },
        artist: playlist.tracks[0].track.artist,
      };
      play(
        firstTrackWithInfo,
        playlist.tracks.map((pt) => pt.track)
      );
    }
  };

  const handlePlayTrack = (track: Track) => {
    if (playlist?.tracks) {
      const trackWithAlbumAndArtist = {
        ...track,
        album: {
          ...track.album,
          coverImage: track.album.coverImage,
        },
        artist: track.artist,
      };
      play(
        trackWithAlbumAndArtist,
        playlist.tracks.map((pt) => pt.track)
      );
    }
  };

  const handleTrackAction = (track: Track) => {
    setSelectedTrack(track);
    setIsAddToPlaylistOpen(true);
  };

  const handleAddToPlaylist = async (playlistId: string) => {
    if (!selectedTrack) return;

    try {
      await addTrackToPlaylist(playlistId, selectedTrack.id);
      showToast("트랙이 플레이리스트에 추가되었습니다.", "success");
      setIsAddToPlaylistOpen(false);
    } catch (error) {
      if (error instanceof Error) {
        showToast(error.message, "error");
      } else {
        showToast("트랙 추가에 실패했습니다.", "error");
      }
    }
  };

  const handleRemoveTrack = async (playlistTrackId: string) => {
    try {
      await removeTrackFromPlaylist(id, playlistTrackId);
      // 플레이리스트 데이터 새로고침
      const updatedPlaylist = await getPlaylist(id);
      setPlaylist(updatedPlaylist);
      showToast("트랙이 플레이리스트에서 제거되었습니다.", "success");
      window.location.reload();
    } catch {
      showToast("트랙 제거에 실패했습니다.", "error");
    }
  };

  const handleReorder = async (reorderedTracks: PlaylistTrackInfo[]) => {
    try {
      await api.put(`/playlists/${id}/tracks/reorder`, {
        tracks: reorderedTracks.map((track) => ({
          id: track.playlistTrackId,
          position: track.position,
        })),
      });

      // 즉시 UI 업데이트
      setPlaylist((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          tracks: reorderedTracks.map((track) => ({
            id: track.playlistTrackId!,
            position: track.position!,
            addedAt: track.addedAt!,
            track: prev.tracks.find((pt) => pt.id === track.playlistTrackId)!
              .track,
          })),
        };
      });
    } catch (error) {
      console.error("Failed to reorder tracks:", error);
      showToast("트랙 순서 변경에 실패했습니다.", "error");
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen">
        {/* Hero Section with Gradient Background */}
        <div className="relative h-[50vh] overflow-hidden">
          {/* Background Image with Blur */}
          <div className="absolute inset-0">
            {playlist.coverImage && (
              <Image
                src={getImageUrl(playlist.coverImage)}
                alt={playlist.title}
                fill
                className="object-cover blur-sm opacity-50"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/80 to-black/90" />
          </div>

          {/* Playlist Info */}
          <div className="container relative flex items-end h-full pb-12 pl-12">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-8 w-full">
              {/* Playlist Cover */}
              <div className="relative aspect-square w-48 md:w-64 rounded-lg overflow-hidden shadow-2xl">
                {playlist.coverImage ? (
                  <Image
                    src={getImageUrl(playlist.coverImage)}
                    alt={playlist.title}
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="w-full h-full bg-white/5 flex items-center justify-center">
                    <IconMusic className="w-12 h-12 text-white/40" />
                  </div>
                )}
              </div>

              {/* Playlist Details */}
              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                    {playlist.title}
                  </h1>
                  <div className="flex items-center gap-2 text-white/60">
                    <Link
                      href={`/${playlist.user.id}`}
                      className="hover:underline"
                    >
                      <span className="font-medium text-white">
                        {playlist.user.name}
                      </span>
                    </Link>
                    <span>•</span>
                    <span>{playlist.tracks.length}곡</span>
                    <span>•</span>
                    <span>{formatTime(totalDuration)}</span>
                  </div>
                </div>
                {playlist.description && (
                  <div className="relative group">
                    <p className="text-white/80 max-w-2xl line-clamp-2 group-hover:line-clamp-none transition-all duration-300">
                      {playlist.description}
                    </p>
                    {playlist.description.length > 50 && (
                      <div className="absolute bottom-0 right-0 bg-gradient-to-l from-black via-black/80 to-transparent px-2 text-xs text-white/60 group-hover:hidden">
                        더보기...
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 태그된 사용자 목록을 우측에 배치 */}
              {playlist.taggedUsers && playlist.taggedUsers.length > 0 && (
                <div className="hidden md:block w-[200px] shrink-0">
                  <TaggedUserList
                    users={playlist.taggedUsers.map((tag) => tag.user as User)}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {playlist.taggedUsers && playlist.taggedUsers.length > 0 && (
          <div className="container pb-4 block md:hidden mx-auto">
            <TaggedUserList
              users={playlist.taggedUsers.map((tag) => tag.user as User)}
            />
          </div>
        )}

        {/* Content Section */}
        <div className="container pb-4">
          {/* Action Buttons */}
          <Tabs defaultValue="tracks" className="mt-8">
            <div className="flex items-center gap-4 mb-8 mx-12">
              <Button
                onClick={handlePlayAll}
                size="lg"
                className="h-10 px-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm
                border border-white/10 hover:border-white/20 rounded-full
                transition-all duration-200 group"
              >
                <PlayCircle className="w-5 h-5 text-white" />
              </Button>

              <ShareButton
                title={playlist.title}
                text={`${playlist.user.name}의 플레이리스트 "${playlist.title}"을 들어보세요.`}
                url={`${process.env.NEXT_PUBLIC_APP_URL}/playlist/${playlist.id}`}
                className="h-10 w-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm
                border border-white/10 hover:border-white/20 rounded-full
                transition-all duration-200 shrink-0"
              />

              <TabsList className="w-full h-10 max-w-[140px] backdrop-blur-md bg-white/5 rounded-full p-1 border border-white/10">
                <TabsTrigger
                  value="tracks"
                  className="w-full h-10 rounded-full data-[state=active]:bg-white/10 data-[state=active]:backdrop-blur-lg transition-all"
                >
                  <IconPlaylist className="w-4 h-4" />
                </TabsTrigger>
                <TabsTrigger
                  value="comments"
                  className="w-full h-10 rounded-full data-[state=active]:bg-white/10 data-[state=active]:backdrop-blur-lg transition-all"
                >
                  <IconMessageCircle className="w-4 h-4" />
                </TabsTrigger>
              </TabsList>

              <div className="ml-auto flex items-center gap-4">
                <LikeButton
                  type="playlist"
                  id={playlist.id}
                  showCount
                  className="h-12 w-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm
                border border-white/10 hover:border-white/20 rounded-full
                transition-all duration-200"
                />

                <PlaylistActions
                  isOwner={isOwner}
                  playlist={playlist}
                  onEdit={() => setIsEditModalOpen(true)}
                />
              </div>
            </div>

            <TabsContent value="tracks" className="mt-6">
              {playlist && playlist.tracks.length > 0 ? (
                <div className="backdrop-blur-md bg-white/5 rounded-lg border border-white/10 mx-12">
                  <TrackList
                    key={playlist.id}
                    tracks={playlist.tracks.map((pt) => ({
                      ...pt.track,
                      playlistTrackId: pt.id,
                      addedAt: pt.addedAt,
                      position: pt.position,
                    }))}
                    showArtist={true}
                    showAlbum={true}
                    onPlay={handlePlayTrack}
                    onAddToPlaylist={handleTrackAction}
                    onRemoveFromPlaylist={
                      isOwner ? handleRemoveTrack : undefined
                    }
                    showRemove={isOwner}
                    onReorder={isOwner ? handleReorder : undefined}
                    isPlaylist={isOwner ? true : false}
                  />
                </div>
              ) : (
                <div className="backdrop-blur-md bg-white/5 rounded-lg border border-white/10 mx-12 p-12">
                  <div className="flex flex-col items-center justify-center text-center space-y-6">
                    <div className="relative w-32 h-32">
                      {/* 배경 그라데이션 효과 */}
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-orange-500/20 rounded-full blur-2xl animate-pulse" />
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full animate-blob animation-delay-2000" />
                      <div className="relative w-full h-full bg-white/5 rounded-full border border-white/10 backdrop-blur-sm flex items-center justify-center">
                        <IconMusic className="w-12 h-12 text-white/40" />
                      </div>
                    </div>

                    <div className="space-y-2 max-w-sm">
                      <h3 className="text-xl font-semibold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                        아직 트랙이 없습니다
                      </h3>
                      <p className="text-sm text-white/40 leading-relaxed">
                        이 플레이리스트에 좋아하는 음악을 추가하여 나만의 특별한
                        컬렉션을 만들어보세요.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="comments" className="mt-6">
              <CommentSection type="PLAYLIST" targetId={playlist.id} />
            </TabsContent>
          </Tabs>
        </div>

        {isEditModalOpen && playlist && (
          <PlaylistEditForm
            playlist={playlist}
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onSuccess={() => {
              // 플레이리스트 데이터 새로고침
              getPlaylist(id).then(setPlaylist);
              setIsEditModalOpen(false);
            }}
          />
        )}

        <AddToPlaylistModal
          track={selectedTrack!}
          isOpen={isAddToPlaylistOpen}
          onClose={() => setIsAddToPlaylistOpen(false)}
          playlists={userPlaylists}
          onAddToPlaylist={handleAddToPlaylist}
        />
      </div>
    </PageTransition>
  );
}
function PlaylistSkeleton() {
  return (
    <div className="container max-w-7xl mx-auto py-8">
      <div className="flex flex-col md:flex-row gap-8 mb-8 animate-pulse">
        <div className="w-48 h-48 md:w-64 md:h-64 bg-white/5 rounded-xl" />
        <div className="flex-1 space-y-4 py-4">
          <div className="h-8 w-64 bg-white/5 rounded-lg" />
          <div className="h-4 w-48 bg-white/5 rounded-lg" />
          <div className="h-4 w-32 bg-white/5 rounded-lg" />
        </div>
      </div>
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-white/5 rounded-lg animate-pulse" />
        ))}
      </div>
    </div>
  );
}
