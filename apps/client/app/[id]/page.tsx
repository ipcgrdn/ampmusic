"use client";

import { useParams } from "next/navigation";
import { PageTransition } from "@/components/ui/page-transition";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileTabs } from "@/components/profile/profile-tabs";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getUserAlbums, getUserTracks } from "@/lib/api/album";
import { addTrackToPlaylist, getUserPlaylists } from "@/lib/api/playlist";
import { Album, Track } from "@/types/album";
import { Playlist } from "@/types/playlist";
import Link from "next/link";
import Image from "next/image";
import { formatDuration, getImageUrl } from "@/lib/utils";
import { PlayCircle } from "lucide-react";
import { usePlayerStore } from "@/lib/store/player-store";
import { IconHeadphones, IconMusic } from "@tabler/icons-react";
import { TrackActions } from "@/components/track/track-actions";
import { AddToPlaylistModal } from "@/components/playlist/add-to-playlist-modal";
import { useToast } from "@/components/ui/toast";
import { LikeButton } from "@/components/common/LikeButton";
import { useQuery } from "@tanstack/react-query";
import { followApi } from "@/lib/api/follow";
import { FollowersModal } from "@/components/profile/followers-modal";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { useAuth } from "@/context/auth-context";

export default function ProfilePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"tracks" | "albums" | "playlists">(
    "tracks"
  );
  const [albums, setAlbums] = useState<Album[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [myPlaylists, setMyPlaylists] = useState<Playlist[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [isAddToPlaylistOpen, setIsAddToPlaylistOpen] = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);
  const { showToast } = useToast();

  const { play } = usePlayerStore();

  const { data: followCounts } = useQuery({
    queryKey: ["follow-counts", id],
    queryFn: () => followApi.getCounts(id as string),
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const albumData = await getUserAlbums(id as string);
        setAlbums(albumData);

        const trackData = await getUserTracks(id as string);
        setTracks(trackData);

        const playlistData = await getUserPlaylists(id as string);
        setPlaylists(playlistData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchData();
  }, [id, activeTab]);

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

  const handlePlayTrack = (track: Track) => {
    if (activeTab === "tracks" && tracks.length > 0) {
      play(track, tracks);
    } else {
      play(track);
    }
  };

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

  const renderContent = () => {
    switch (activeTab) {
      /* 앨범 */
      case "albums":
        return (
          albums.length > 0 &&
          albums.map((album) => (
            <Link
              key={album.id}
              href={`/album/${album.id}`}
              className="group relative backdrop-blur-lg bg-white/5 rounded-xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300 hover:transform hover:scale-[1.02]"
            >
              <div className="aspect-square bg-gradient-to-br from-white/5 to-transparent relative">
                {album.coverImage && (
                  <Image
                    src={`${process.env.NEXT_PUBLIC_API_URL}${album.coverImage}`}
                    alt={album.title}
                    fill
                    className="object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-[#533483]/20 via-transparent to-[#e6c200]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/50 to-transparent">
                <div className="text-sm font-medium text-white truncate">
                  {album.title}
                </div>
                <div className="flex items-center gap-2 text-xs text-white/60 mt-1">
                  <span>{album.tracks.length} tracks</span>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  <button className="w-full py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-lg text-sm font-medium text-white transition-all duration-300 border border-white/20 hover:border-white/40">
                    Play Now
                  </button>
                </div>
              </div>
            </Link>
          ))
        );

      /* 트랙 */
      case "tracks":
        return (
          <div className="space-y-4">
            <div className="space-y-1">
              {tracks.length > 0 ? (
                tracks.map((track, index) => (
                  <div
                    key={track.id}
                    className="group flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="w-8 text-center flex-shrink-0">
                      <span className="text-sm text-white/40 group-hover:hidden">
                        {index + 1}
                      </span>
                      <PlayCircle
                        className="w-4 h-4 hidden group-hover:block text-white mx-auto"
                        onClick={() => handlePlayTrack(track)}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate">
                        {track.title}
                      </div>
                      <div className="text-xs text-white/60 truncate flex items-center gap-1">
                        <span>{track.artist.name}</span>
                        <span className="text-white/40">•</span>
                        <Link
                          href={`/album/${track.albumId}`}
                          className="text-xs text-white/60 truncate hover:underline"
                        >
                          {track.album.title}
                        </Link>
                      </div>
                    </div>
                    <div className="w-20 text-right flex-shrink-0">
                      <span className="text-sm text-white/40">
                        {formatDuration(track.duration)}
                      </span>
                    </div>
                    <div className="w-12 pl-4">
                      <LikeButton
                        type="track"
                        id={track.id}
                        className="w-8 h-8"
                        showCount={true}
                      />
                    </div>
                    <div className="pl-4 flex items-center gap-4">
                      <IconHeadphones size={16} className="text-white/40" />
                      <span className="text-white/40 text-xs">
                        {track.plays?.toLocaleString() || 0}
                      </span>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <TrackActions
                        track={track}
                        onAddToPlaylist={handleTrackAction}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-white/40">
                  트랙이 없습니다
                </div>
              )}
            </div>
          </div>
        );

      /* 플레이리스트 */
      case "playlists":
        return (
          playlists.length > 0 &&
          playlists.map((playlist) => (
            <Link
              key={playlist.id}
              href={`/playlist/${playlist.id}`}
              className="group relative backdrop-blur-lg bg-white/5 rounded-xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300 hover:transform hover:scale-[1.02]"
            >
              <div className="aspect-square bg-gradient-to-br from-white/5 to-transparent relative">
                {playlist.coverImage ? (
                  <Image
                    src={getImageUrl(playlist.coverImage)}
                    alt={playlist.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <IconMusic className="w-1/3 h-1/3 text-white/20" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-[#533483]/20 via-transparent to-[#e6c200]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/50 to-transparent">
                <div className="text-sm font-medium text-white truncate">
                  {playlist.title}
                </div>
                <div className="flex items-center gap-2 text-xs text-white/60 mt-1">
                  <span>{playlist.tracks.length} tracks</span>
                  {!playlist.isPublic && (
                    <>
                      <span>•</span>
                      <span>비공개</span>
                    </>
                  )}
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  <button className="w-full py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-lg text-sm font-medium text-white transition-all duration-300 border border-white/20 hover:border-white/40">
                    Play Now
                  </button>
                </div>
              </div>
            </Link>
          ))
        );

      default:
        return null;
    }
  };

  return (
    <PageTransition>
      <div className="relative w-full bg-black min-h-screen">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[#533483]/20 via-black to-black" />
          <div className="absolute top-0 left-0 w-full h-[60vh] bg-gradient-to-br from-[#e6c200]/10 via-[#533483]/10 to-transparent" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000012_1px,transparent_1px),linear-gradient(to_bottom,#00000012_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
        </div>

        <main className="relative">
          <div className="px-4 lg:px-8 pt-6 lg:pt-10 pb-6">
            <ProfileHeader userId={id as string} />
          </div>

          <div className="px-4 lg:px-8 py-6 border-t border-b border-white/10">
            <div className="relative backdrop-blur-xl bg-white/5 rounded-2xl p-6 max-w-3xl mx-auto">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 pointer-events-none" />
              <div className="relative flex justify-around">
                {[
                  { label: "트랙", count: tracks.length },
                  { label: "앨범", count: albums.length },
                  { label: "플레이리스트", count: playlists.length },
                  {
                    label: "팔로워",
                    count: followCounts?.followers || 0,
                    onClick: () => setShowFollowers(true),
                  },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className="text-center group cursor-pointer"
                    onClick={stat.onClick}
                  >
                    <div className="text-3xl font-bold bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent group-hover:from-[#e6c200] group-hover:to-[#533483] transition-all duration-300">
                      <AnimatedNumber value={stat.count} />
                    </div>
                    <div className="text-sm text-white/60 group-hover:text-white/80 transition-colors">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="sticky top-0 z-10 backdrop-blur-xl bg-black/40 border-b border-white/10">
            <div className="px-4 lg:px-8 max-w-7xl mx-auto">
              <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />
            </div>
          </div>

          <div className="px-4 lg:px-8 py-8 max-w-7xl mx-auto">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className={`grid gap-4 ${
                activeTab === "tracks"
                  ? "grid-cols-1"
                  : "grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              }`}
            >
              {renderContent()}
            </motion.div>
          </div>
        </main>
      </div>
      <AddToPlaylistModal
        track={selectedTrack!}
        isOpen={isAddToPlaylistOpen}
        onClose={() => setIsAddToPlaylistOpen(false)}
        playlists={myPlaylists}
        onAddToPlaylist={handleAddToPlaylist}
      />
      <FollowersModal
        userId={id as string}
        isOpen={showFollowers}
        onClose={() => setShowFollowers(false)}
      />
    </PageTransition>
  );
}
