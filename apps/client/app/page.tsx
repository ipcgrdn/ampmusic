"use client";

import { Suspense } from "react";
import { motion } from "framer-motion";
import { Loading } from "@/components/ui/loading";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  IconUsers,
  IconSparkles,
  IconUsersGroup,
  IconActivity,
  IconHeart,
} from "@tabler/icons-react";

import { FollowingUpdates } from "@/components/home/following-updates";
import { TrackRecommendations } from "@/components/home/track-recommendations";
import { SimilarUsersTracks } from "@/components/home/similar-users-tracks";
import { FollowingActivity } from "@/components/home/following-activity";
import { FollowingLikes } from "@/components/home/following-likes";
import Link from "next/link";
export default function Home() {
  return (
    <div className="relative min-h-full">
      {/* 배경 효과 */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-background to-blue-500/5 pointer-events-none -z-20" />
      <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none -z-10" />

      <ScrollArea className="h-full">
        <div className="relative px-6 py-8 lg:px-8 space-y-8 max-w-[1800px] mx-auto">
          {/* 1. 팔로우한 유저들의 최신 업데이트 */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="backdrop-blur-xl bg-white/[0.02] rounded-2xl border border-white/[0.05] shadow-2xl">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <IconUsers className="w-6 h-6 text-purple-400" />
                  <h2 className="text-2xl font-bold text-white">
                    팔로우 업데이트
                  </h2>
                </div>
                <Suspense fallback={<Loading />}>
                  <FollowingUpdates />
                </Suspense>
              </div>
            </div>
          </motion.section>

          {/* 2. 추천 트랙 */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="backdrop-blur-xl bg-white/[0.02] rounded-2xl border border-white/[0.05] shadow-2xl">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <IconSparkles className="w-6 h-6 text-amber-400" />
                  <h2 className="text-2xl font-bold text-white">추천 트랙</h2>
                </div>
                <Suspense fallback={<Loading />}>
                  <TrackRecommendations />
                </Suspense>
              </div>
            </div>
          </motion.section>

          {/* 3. 비슷한 취향의 유저들이 좋아하는 트랙 */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="backdrop-blur-xl bg-white/[0.02] rounded-2xl border border-white/[0.05] shadow-2xl">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <IconUsersGroup className="w-6 h-6 text-blue-400" />
                  <h2 className="text-2xl font-bold text-white">
                    비슷한 취향의 유저들이 좋아하는
                  </h2>
                </div>
                <Suspense fallback={<Loading />}>
                  <SimilarUsersTracks />
                </Suspense>
              </div>
            </div>
          </motion.section>

          {/* 4. 팔로우한 유저들의 활동 */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="backdrop-blur-xl bg-white/[0.02] rounded-2xl border border-white/[0.05] shadow-2xl">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <IconActivity className="w-6 h-6 text-green-400" />
                  <h2 className="text-2xl font-bold text-white">
                    팔로우한 유저들의 활동
                  </h2>
                </div>
                <Suspense fallback={<Loading />}>
                  <FollowingActivity />
                </Suspense>
              </div>
            </div>
          </motion.section>

          {/* 5. 팔로우한 유저들의 좋아요 */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <div className="backdrop-blur-xl bg-white/[0.02] rounded-2xl border border-white/[0.05] shadow-2xl">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <IconHeart className="w-6 h-6 text-red-400" />
                  <h2 className="text-2xl font-bold text-white">
                    팔로우한 유저들이 좋아하는
                  </h2>
                </div>
                <Suspense fallback={<Loading />}>
                  <FollowingLikes />
                </Suspense>
              </div>
            </div>
          </motion.section>

          <div className="flex items-center justify-center">
            <p className="text-xs text-white/50">
              <Link href="/docs/privacy" className="hover:underline">
                개인정보처리방침
              </Link>{" "}
              •
              <Link href="/docs/terms" className="hover:underline">
                이용약관
              </Link>{" "}
              •
              <Link href="/docs/youth" className="hover:underline">
                청소년보호정책
              </Link>{" "}
              •
              <Link href="/docs/copyright" className="hover:underline">
                저작권정책
              </Link>{" "}
              •
              <Link href="/docs/support" className="hover:underline">
                고객센터
              </Link>{" "}
              •
              <Link href="/docs/cookie" className="hover:underline">
                쿠키정책
              </Link>{" "}
              •
              <Link href="/docs/about" className="hover:underline">
                소개
              </Link>{" "}
            </p>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
