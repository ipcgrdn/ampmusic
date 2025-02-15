"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import { Playlist } from "@/types/playlist";
import Link from "next/link";
import Image from "next/image";
import { getImageUrl } from "@/lib/utils";
import { IconHeart, IconMusic, IconUser } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

export function PopularPlaylists() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [displayCount, setDisplayCount] = useState(5);

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const { data } = await api.get("/playlists/popular");
        setPlaylists(data);
      } catch (error) {
        console.error("Failed to fetch popular playlists:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlaylists();
  }, []);

  if (isLoading) {
    return (
      <div className="grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="aspect-[4/5] bg-white/5 animate-pulse rounded-xl"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
        {playlists.slice(0, displayCount).map((playlist) => (
          <Link
            key={playlist.id}
            href={`/playlist/${playlist.id}`}
            className="group relative bg-white/[0.03] backdrop-blur-xl rounded-xl 
              border border-white/[0.05] hover:border-white/[0.1] 
              transition-all duration-300 hover:transform hover:scale-[1.02]
              overflow-hidden aspect-[4/5]"
          >
            <div
              className="absolute inset-0 bg-gradient-to-b from-white/[0.07] 
                to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            />

            <div className="p-2 sm:p-2.5 h-full flex flex-col">
              <div className="relative aspect-square overflow-hidden rounded-lg flex-shrink-0">
                <Image
                  src={getImageUrl(playlist.coverImage)}
                  alt={playlist.title}
                  fill
                  className="object-cover transition-transform duration-500 
                    group-hover:scale-105"
                />
                <div
                  className="absolute inset-0 bg-black/20 opacity-0 
                    group-hover:opacity-100 transition-opacity duration-300"
                />
              </div>

              <div className="flex-1 flex flex-col justify-between mt-2 sm:mt-2.5">
                <h3
                  className="font-medium text-xs sm:text-sm text-white/90 truncate
                  group-hover:text-white transition-colors duration-300"
                >
                  {playlist.title}
                </h3>

                <div className="mt-auto">
                  <div className="flex items-center gap-1 text-white/60 text-xs">
                    <IconUser
                      size={12}
                      className="text-white/40 flex-shrink-0"
                    />
                    <span className="truncate text-[10px] sm:text-xs">
                      {playlist.user.name}
                    </span>
                    <div className="flex gap-1.5">
                      <div
                        className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full 
                      bg-white/[0.05] text-white/60 text-[10px] backdrop-blur-md"
                      >
                        <IconHeart size={10} className="flex-shrink-0" />
                        <span>{playlist._count.likes}</span>
                      </div>
                      <div
                        className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full 
                      bg-white/[0.05] text-white/60 text-[10px] backdrop-blur-md"
                      >
                        <IconMusic size={10} className="flex-shrink-0" />
                        <span>{playlist._count.tracks}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {displayCount < playlists.length && (
        <div className="flex justify-center pt-2">
          <Button
            variant="ghost"
            onClick={() =>
              setDisplayCount((prev) => Math.min(prev + 5, playlists.length))
            }
            className="w-full sm:w-auto px-4 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] 
              text-white/60 hover:text-white backdrop-blur-md text-xs
              border border-white/[0.05] hover:border-white/[0.1]
              transition-all duration-300"
          >
            더 보기
          </Button>
        </div>
      )}
    </div>
  );
}
