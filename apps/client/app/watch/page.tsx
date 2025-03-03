"use client";

import { usePlayerStore } from "@/lib/store/player-store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { NowPlayingView } from "@/components/watch/now-playing-view";
import { QueueView } from "@/components/watch/queue-view";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

export default function WatchPage() {
  const { currentTrack } = usePlayerStore();
  const router = useRouter();
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  // 재생 중인 트랙이 없으면 홈으로 리다이렉트
  useEffect(() => {
    if (!currentTrack) {
      router.push('/');
    }
  }, [currentTrack, router]);

  if (!currentTrack) return null;

  return (
    <div className="relative min-h-[calc(100vh-6rem)] w-full bg-gradient-to-br from-purple-500/5 via-black to-indigo-500/5">
      {/* 배경 블러 효과 */}
      <div className="absolute inset-0 backdrop-blur-3xl" />
      
      {/* 배경 애니메이션 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-purple-500/20 mix-blend-screen blur-3xl animate-blob" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-indigo-500/20 mix-blend-screen blur-3xl animate-blob animation-delay-2000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-blue-500/20 mix-blend-screen blur-3xl animate-blob animation-delay-4000" />
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="relative flex flex-col lg:flex-row h-[calc(100vh-6rem)]">
        {/* 현재 재생 중인 트랙 정보 - 고정 */}
        <div className="flex-1 p-4 lg:p-8 lg:border-r border-white/[0.05] lg:overflow-hidden">
          <div className="h-full backdrop-blur-md bg-black/40 rounded-2xl border border-white/[0.05] p-6 lg:p-8">
            <NowPlayingView />
          </div>
        </div>

        {/* 재생 큐 - 스크롤 가능 */}
        <div className={cn(
          "w-full lg:w-[400px] lg:h-[calc(100vh-6rem)]",
          "transition-all duration-300",
          isDesktop ? "opacity-100" : "opacity-95"
        )}>
          <div className="h-full backdrop-blur-xl bg-black/20 overflow-y-auto">
            <QueueView />
          </div>
        </div>
      </div>
    </div>
  );
} 