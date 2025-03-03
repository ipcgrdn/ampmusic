"use client";

import { useEffect, useState } from "react";
import { Album } from "@/types/album";
import { api } from "@/lib/axios";
import Image from "next/image";
import Link from "next/link";
import { getImageUrl } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { Button } from "@/components/ui/button";

export function NewReleases() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [displayCount, setDisplayCount] = useState(10);

  useEffect(() => {
    const fetchNewReleases = async () => {
      try {
        const { data } = await api.get("/albums/new-releases");
        setAlbums(data);
      } catch (error) {
        console.error("[NewReleases] Failed to fetch new releases:", {
          message: (error as Error).message,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchNewReleases();
  }, []);

  const formatReleaseDate = (date: string) => {
    const releaseDate = new Date(date);
    const now = new Date();

    if (releaseDate > now) {
      return "발매 예정";
    }

    return formatDistanceToNow(releaseDate, {
      addSuffix: true,
      locale: ko,
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-wrap gap-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-48 h-64 bg-white/5 animate-pulse rounded-lg"
          />
        ))}
      </div>
    );
  }

  if (albums.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 px-4">
        <p className="text-sm text-white/40 text-center">
          현재 신규 발매된 앨범이 없습니다
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {albums.slice(0, displayCount).map((album) => (
          <Link
            key={album.id}
            href={`/album/${album.id}`}
            className="group relative bg-black/40 backdrop-blur-xl rounded-2xl 
              border border-white/[0.05] hover:border-white/[0.1] 
              transition-all duration-300 hover:transform hover:scale-[1.02]
              overflow-hidden"
          >
            <div
              className="absolute -inset-[1px] rounded-2xl bg-gradient-to-b 
              from-black/50 to-transparent opacity-0 group-hover:opacity-100 
              transition-opacity duration-500"
            />

            <div className="relative p-3 space-y-3">
              <div className="relative aspect-square overflow-hidden rounded-xl">
                <Image
                  src={getImageUrl(album.coverImage)}
                  alt={album.title}
                  fill
                  className="object-cover transition-transform duration-500 
                    group-hover:scale-105"
                />
                <div
                  className="absolute inset-0 bg-black/20 opacity-0 
                  group-hover:opacity-100 transition-opacity duration-300"
                />
              </div>

              <div className="space-y-1.5">
                <h3
                  className="font-medium text-sm text-white/90 truncate
                  group-hover:text-white transition-colors duration-300"
                >
                  {album.title}
                </h3>
                <div className="flex items-center gap-2">
                  <span
                    className="text-sm text-white/60 truncate 
                      cursor-pointer transition-colors duration-300"
                  >
                    {album.artist.name}
                  </span>
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded-full 
                    bg-white/[0.05] text-white/40 backdrop-blur-md"
                  >
                    {formatReleaseDate(album.releaseDate)}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {displayCount < albums.length && (
        <div className="flex justify-center pt-2">
          <Button
            variant="ghost"
            onClick={() =>
              setDisplayCount((prev) => Math.min(prev + 10, albums.length))
            }
            className="px-6 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] 
              text-white/60 hover:text-white backdrop-blur-md
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
