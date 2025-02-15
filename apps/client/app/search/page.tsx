"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { SearchPageResults } from "@/components/search/SearchPageResults";
import { SearchFilters } from "@/components/search/SearchFilters";
import { IconSearch } from "@tabler/icons-react";

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const type = (searchParams.get("type") as "all" | "albums" | "tracks" | "playlists" | "users") || "all";
  const sort = searchParams.get("sort") || "relevance";

  const {
    data,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["search", query, type, sort],
    queryFn: async () => {
      if (!query) return { 
        tracks: [], 
        albums: [], 
        playlists: [], 
        users: []
      };

      const { data } = await api.get("/search", {
        params: {
          q: query,
          type,
          sort,
          limit: 20
        }
      });
      return data;
    },
    enabled: query.length > 0,
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 5,
  });

  // URL 파라미터 업데이트 함수
  const updateSearchParams = (params: { type?: string; sort?: string }) => {
    const newSearchParams = new URLSearchParams(searchParams);
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        newSearchParams.set(key, value);
      } else {
        newSearchParams.delete(key);
      }
    });
    router.push(`/search?${newSearchParams.toString()}`);
  };

  return (
    <div className="container max-w-7xl mx-auto px-4 py-6 min-h-[calc(100vh-5rem)]">
      {/* 검색 헤더 */}
      <div className="mb-8 bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] rounded-2xl p-6">
        <h1 className="text-2xl font-bold flex items-center gap-3 text-white">
          <IconSearch className="w-6 h-6 text-purple-400" />
          {query ? (
            <span className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
              &quot;{query}&quot;에 대한 검색 결과
            </span>
          ) : (
            "검색"
          )}
        </h1>
        
        {/* 필터 */}
        <div className="mt-6">
          <SearchFilters
            type={type}
            sort={sort}
            onTypeChange={(newType) => updateSearchParams({ type: newType })}
            onSortChange={(newSort) => updateSearchParams({ sort: newSort })}
          />
        </div>
      </div>

      {/* 검색 결과 */}
      <div className="relative">
        {/* 배경 그라데이션 효과 */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 to-blue-500/10 opacity-50 pointer-events-none blur-3xl" />
        
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-pulse text-white/60">검색 중...</div>
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-red-400">검색 중 오류가 발생했습니다</div>
          </div>
        ) : !query ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-white/60">검색어를 입력해주세요</div>
          </div>
        ) : data ? (
          <SearchPageResults pages={data} />
        ) : (
          <div className="flex items-center justify-center py-20">
            <div className="text-white/60">검색 결과가 없습니다</div>
          </div>
        )}
      </div>
    </div>
  );
} 