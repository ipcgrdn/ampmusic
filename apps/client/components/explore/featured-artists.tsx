"use client";

import { useQuery } from "@tanstack/react-query";
import { getFeaturedArtists } from "@/lib/api/user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import Image from "next/image";
import { IconArrowUpRight, IconDisc } from "@tabler/icons-react";
import { AnimatedNumber } from "@/components/ui/animated-number";

export function FeaturedArtists() {
  const { data: artists, isLoading } = useQuery({
    queryKey: ["featured-artists"],
    queryFn: getFeaturedArtists,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-[280px] rounded-xl bg-white/5 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!artists?.length) return null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {artists.map((artist) => (
        <Link
          key={artist.id}
          href={`/${artist.id}`}
          className="group relative rounded-xl bg-white/[0.03] border border-white/10 
            hover:bg-white/[0.05] hover:border-white/20 transition-all duration-300 overflow-hidden"
        >
          {/* 배경 그라데이션 */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />

          <div className="relative p-6 space-y-4">
            {/* 아티스트 정보 */}
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16 rounded-xl border border-white/10">
                <AvatarImage src={artist.avatar} />
                <AvatarFallback>{artist.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-lg text-white group-hover:text-purple-400 transition-colors">
                  {artist.name}
                </h3>
                {artist.bio && (
                  <p className="text-sm text-white/60 line-clamp-1">{artist.bio}</p>
                )}
              </div>
            </div>

            {/* 메트릭스 */}
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { label: "팔로워", value: artist.metrics.followers, growth: artist.metrics.followerGrowth },
                { label: "좋아요", value: artist.metrics.likes, growth: artist.metrics.likeGrowth },
                { label: "재생", value: artist.metrics.plays, growth: artist.metrics.playGrowth },
              ].map((metric) => (
                <div key={metric.label} className="space-y-1">
                  <div className="text-xs text-white/40">{metric.label}</div>
                  <div className="font-medium">
                    <AnimatedNumber value={metric.value} />
                  </div>
                  <div className={`text-xs ${metric.growth > 0 ? "text-green-400" : "text-white/40"}`}>
                    {metric.growth > 0 && "+"}
                    {metric.growth.toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>

            {/* 최근 앨범 */}
            {artist.recentAlbum && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                <div className="relative w-12 h-12 rounded-md overflow-hidden">
                  <Image
                    src={`${process.env.NEXT_PUBLIC_API_URL}${artist.recentAlbum.coverImage}`}
                    alt={artist.recentAlbum.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white/80 truncate">
                    {artist.recentAlbum.title}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/40">
                    <IconDisc size={12} />
                    <span>최신 앨범</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 호버 효과 */}
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <IconArrowUpRight className="w-5 h-5 text-purple-400" />
          </div>
        </Link>
      ))}
    </div>
  );
} 