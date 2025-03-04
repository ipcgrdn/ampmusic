import { Suspense } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loading } from "@/components/ui/loading";
import { TopCharts } from "@/components/explore/top-charts";
import { NewReleases } from "@/components/explore/new-releases";
import { PopularPlaylists } from "@/components/explore/popular-playlists";
import { FeaturedArtists } from "@/components/explore/featured-artists";
import {
  IconChartBar,
  IconDisc,
  IconUsers,
  IconPlaylist,
} from "@tabler/icons-react";

export default function ExplorePage() {
  return (
    <div className="relative min-h-full">
      {/* 배경 효과 - absolute로 변경하고 z-index 조정 */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-background to-blue-500/5 pointer-events-none -z-20" />
      <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none -z-10" />

      <ScrollArea className="h-full">
        <div className="relative px-4 py-8 lg:px-8 space-y-8 max-w-[1800px] mx-auto">
          {/* 실시간 차트 섹션 */}
          <section>
            <div className="backdrop-blur-xl bg-white/[0.02] rounded-2xl border border-white/[0.05] shadow-2xl">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <IconChartBar className="w-6 h-6 text-purple-400" />
                  <h2 className="text-lg sm:text-2xl font-bold text-white">실시간 차트</h2>
                </div>
                <Suspense fallback={<Loading />}>
                  <TopCharts />
                </Suspense>
              </div>
            </div>
          </section>

          {/* 신규 발매 섹션 */}
          <section>
            <div className="backdrop-blur-xl bg-white/[0.02] rounded-2xl border border-white/[0.05] shadow-2xl">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <IconDisc className="w-6 h-6 text-emerald-400" />
                  <h2 className="text-lg sm:text-2xl font-bold text-white">신규 발매</h2>
                </div>
                <Suspense fallback={<Loading />}>
                  <NewReleases />
                </Suspense>
              </div>
            </div>
          </section>

          {/* 인기 플레이리스트 섹션 */}
          <section>
            <div className="backdrop-blur-xl bg-white/[0.02] rounded-2xl border border-white/[0.05] shadow-2xl">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <IconPlaylist className="w-6 h-6 text-blue-400" />
                  <h2 className="text-lg sm:text-2xl font-bold text-white">
                    인기 플레이리스트
                  </h2>
                </div>
                <Suspense fallback={<Loading />}>
                  <PopularPlaylists />
                </Suspense>
              </div>
            </div>
          </section>

          {/* 주목할 아티스트 섹션 */}
          <section>
            <div className="backdrop-blur-xl bg-white/[0.02] rounded-2xl border border-white/[0.05] shadow-2xl">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <IconUsers className="w-6 h-6 text-pink-400" />
                  <h2 className="text-lg sm:text-2xl font-bold text-white">
                    주목할 아티스트
                  </h2>
                </div>
                <Suspense fallback={<Loading />}>
                  <FeaturedArtists />
                </Suspense>
              </div>
            </div>
          </section>
        </div>
      </ScrollArea>
    </div>
  );
}
