"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { getAlbum } from "@/lib/api/album";
import { Album, Track } from "@/types/album";
import { formatDuration, getImageUrl } from "@/lib/utils";
import { PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { AlbumActions } from "@/components/album/album-actions";
import { AlbumEditForm } from "@/components/album/album-edit-form";
import { Loading } from "@/components/ui/loading";
import { usePlayerStore } from "@/lib/store/player-store";
import { PageTransition } from "@/components/ui/page-transition";
import { LikeButton } from "@/components/common/LikeButton";
import { TrackActions } from "@/components/track/track-actions";
import { useToast } from "@/components/ui/toast";
import { AddToPlaylistModal } from "@/components/playlist/add-to-playlist-modal";
import { Playlist } from "@/types/playlist";
import { addTrackToPlaylist, getUserPlaylists } from "@/lib/api/playlist";
import { CommentSection } from "@/components/comments/CommentSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  IconDisc,
  IconHeadphones,
  IconMessageCircle,
} from "@tabler/icons-react";
import { ShareButton } from "@/components/common/ShareButton";
import { TaggedUserList } from "@/components/tag/tagged-user-list";
import { User } from "@/types/auth";

export default function AlbumPage() {
  const { id } = useParams();
  const [album, setAlbum] = useState<Album | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { play } = usePlayerStore();

  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [isAddToPlaylistOpen, setIsAddToPlaylistOpen] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchAlbum = async () => {
      try {
        const data = await getAlbum(id as string);
        setAlbum(data);
      } catch (error) {
        console.error("Failed to fetch album:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlbum();
  }, [id]);

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const data = await getUserPlaylists(user?.id as string);
        setPlaylists(data);
      } catch (error) {
        console.error("Failed to fetch playlists:", error);
      }
    };

    if (user) {
      fetchPlaylists();
    }
  }, [user]);

  if (isLoading) {
    return <Loading />;
  }

  if (!album) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        앨범을 찾을 수 없습니다.
      </div>
    );
  }

  const isOwner = user?.id === album?.artist.id;

  // 전체 재생 핸들러 수정
  const handlePlayAll = () => {
    if (!album || !album.tracks || album.tracks.length === 0) return;

    // 트랙을 order 기준으로 정렬하고 Player에 필요한 형식으로 변환
    const tracksToPlay = [...album.tracks]
      .sort((a, b) => a.order - b.order) // order로 정렬하여 순서 보장
      .map((track) => ({
        id: track.id,
        title: track.title,
        duration: track.duration,
        audioUrl: track.audioUrl,
        description: track.description,
        credit: track.credit,
        lyrics: track.lyrics,
        album: {
          id: album.id,
          title: album.title,
          coverImage: album.coverImage,
        },
        artist: album.artist,
      }));

    // 첫 번째 트랙을 재생하고 나머지는 큐에 추가
    play(tracksToPlay[0] as Track, tracksToPlay as Track[]);
  };

  // 트랙 재생 핸들러 수정
  const handlePlayTrack = (selectedTrack: Track) => {
    if (!album || !album.tracks) return;

    // 앨범의 모든 트랙을 order 기준으로 정렬
    const orderedTracks = [...album.tracks]
      .sort((a, b) => a.order - b.order)
      .map((track) => ({
        id: track.id,
        title: track.title,
        duration: track.duration,
        audioUrl: track.audioUrl,
        description: track.description,
        credit: track.credit,
        lyrics: track.lyrics,
        album: {
          id: album.id,
          title: album.title,
          coverImage: album.coverImage,
        },
        artist: album.artist,
      }));

    // 선택된 트랙의 인덱스 찾기
    const selectedIndex = orderedTracks.findIndex(
      (track) => track.id === selectedTrack.id
    );

    if (selectedIndex !== -1) {
      // 큐는 1번부터 순서대로 유지하면서, 선택된 트랙부터 재생 시작
      play(orderedTracks[selectedIndex] as Track, orderedTracks as Track[]);
    }
  };

  const handleAddToPlaylist = async (playlistId: string) => {
    if (!selectedTrack) return;

    try {
      await addTrackToPlaylist(playlistId, selectedTrack.id);
      showToast("트랙이 플레이리스트에 추가되었습니다.", "success");
      setIsAddToPlaylistOpen(false);
    } catch (error) {
      console.error("Failed to add track to playlist:", error);
      showToast("트랙 추가에 실패했습니다.", "error");
    }
  };

  const handleTrackAction = (track: Track) => {
    if (!user) {
      showToast("로그인이 필요합니다.", "error");
      return;
    }
    setSelectedTrack(track);
    setIsAddToPlaylistOpen(true);
  };

  return (
    <PageTransition>
      <div className="min-h-screen">
        {/* Hero Section with Gradient Background */}
        <div className="relative h-[50vh] overflow-hidden">
          {/* Background Image with Blur */}
          <div className="absolute inset-0">
            <Image
              src={getImageUrl(album.coverImage)}
              alt={album.title}
              fill
              className="object-cover blur-sm opacity-50"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/80 to-black/90" />
          </div>

          {/* Album Info */}
          <div className="container relative flex items-end h-full pb-12 pl-12">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-8 w-full">
              {/* Album Cover */}
              <div className="relative aspect-square w-48 md:w-64 rounded-lg overflow-hidden shadow-2xl">
                <Image
                  src={getImageUrl(album.coverImage)}
                  alt={album.title}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Album Details */}
              <div className="flex-1 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                      {album?.title}
                    </h1>
                    <div className="flex items-center gap-2 text-white/60">
                      <Link
                        href={`/${album.artist.id}`}
                        className="hover:underline"
                      >
                        <span className="font-medium text-white">
                          {album.artist.name}
                        </span>
                      </Link>
                      <span>•</span>
                      <span>{new Date(album.releaseDate).getFullYear()}</span>
                      <span>•</span>
                      <span>{album.tracks.length}곡</span>
                    </div>
                  </div>
                </div>
                {album.description && (
                  <p className="text-white/80 max-w-2xl">{album.description}</p>
                )}
              </div>

              {/* 태그된 사용자 목록을 우측에 배치 */}
              {album.taggedUsers && album.taggedUsers.length > 0 && (
                <div className="hidden md:block w-[200px] shrink-0">
                  <TaggedUserList
                    users={album.taggedUsers.map((tag) => tag.user as User)}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {album.taggedUsers && album.taggedUsers.length > 0 && (
          <div className="container pb-4 block md:hidden mx-auto">
            <TaggedUserList
              users={album.taggedUsers.map((tag) => tag.user as User)}
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
                title={album.title}
                text={`${album.artist.name}의 앨범 "${album.title}"을 들어보세요.`}
                url={`${process.env.NEXT_PUBLIC_APP_URL}/album/${album.id}`}
                className="h-10 w-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm
                border border-white/10 hover:border-white/20 rounded-full
                transition-all duration-200 shrink-0"
              />

              <TabsList className="w-full h-10 max-w-[140px] backdrop-blur-md bg-white/5 rounded-full border border-white/10">
                <TabsTrigger
                  value="tracks"
                  className="w-full h-10 rounded-full data-[state=active]:bg-white/10 data-[state=active]:backdrop-blur-lg transition-all"
                >
                  <IconDisc className="w-4 h-4" />
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
                  type="album"
                  id={album.id}
                  showCount
                  className="h-12 w-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm
                border border-white/10 hover:border-white/20 rounded-full
                transition-all duration-200"
                />

                <AlbumActions
                  album={album}
                  onEdit={() => setIsEditModalOpen(true)}
                  isOwner={isOwner}
                />
              </div>
            </div>

            <TabsContent value="tracks" className="mt-6">
              {/* Track List */}
              <div className="backdrop-blur-md bg-white/5 rounded-lg border border-white/10 mx-12">
                <div className="divide-y divide-white/10">
                  {[...album.tracks]
                    .sort((a, b) => a.order - b.order)
                    .map((track) => (
                      <div
                        key={track.id}
                        className="grid grid-cols-[48px_1fr_auto_auto_auto_auto] gap-4 px-4 py-3 hover:bg-white/5 
                        transition-colors group items-center"
                      >
                        {/* Track Number & Play Button */}
                        <div className="flex items-center justify-center">
                          <span className="text-sm text-white/60 group-hover:hidden">
                            {track.order}
                          </span>
                          <PlayCircle
                            className="w-4 h-4 hidden group-hover:block text-white cursor-pointer"
                            onClick={() => handlePlayTrack(track)}
                          />
                        </div>

                        {/* Track Title */}
                        <div className="min-w-0">
                          <p className="font-medium text-white group-hover:text-white/90 truncate">
                            {track.title}
                          </p>
                        </div>

                        {/* Duration */}
                        <div className="text-sm text-white/60 pr-4">
                          {formatDuration(track.duration)}
                        </div>

                        {/* Like Button */}
                        <div>
                          <LikeButton
                            type="track"
                            id={track.id}
                            showCount={true}
                            className="w-8 h-8"
                          />
                        </div>

                        <div className="pl-4 flex items-center gap-4">
                          <IconHeadphones size={16} className="text-white/40" />
                          <span className="text-white/40 text-xs">
                            {track.plays?.toLocaleString() || 0}
                          </span>
                        </div>

                        {/* Track Actions */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <TrackActions
                            track={track}
                            onAddToPlaylist={handleTrackAction}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="comments" className="mt-6">
              <CommentSection type="ALBUM" targetId={album.id} />
            </TabsContent>
          </Tabs>
        </div>

        {/* 수정 모달 추가 */}
        {isEditModalOpen && album && (
          <AlbumEditForm
            album={album}
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onSuccess={() => {
              // 앨범 데이터 새로고침
              getAlbum(id as string).then(setAlbum);
              setIsEditModalOpen(false);
            }}
          />
        )}
      </div>
      {isAddToPlaylistOpen && selectedTrack && (
        <AddToPlaylistModal
          isOpen={isAddToPlaylistOpen}
          onClose={() => setIsAddToPlaylistOpen(false)}
          playlists={playlists}
          onAddToPlaylist={handleAddToPlaylist}
          track={selectedTrack}
        />
      )}
    </PageTransition>
  );
}
