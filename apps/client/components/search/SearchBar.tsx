"use client";

import { useQueryState } from "nuqs";
import { IconSearch, IconX, IconFilter } from "@tabler/icons-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { useDebounce } from "@/hooks/use-debounce";
import { SearchResults } from "./SearchResults";
import { cn } from "@/lib/utils";
import { SearchFilters } from "./SearchFilters";
import { SearchHistory } from "./SearchHistory";
import { useSearchHistoryStore } from "@/lib/store/search-history-store";
import { useState, useEffect, useRef } from "react";
import { SearchSuggestions } from "./SearchSuggestions";
import { useRouter } from "next/navigation";
import { Track } from "@/types/album";
import { Album } from "@/types/album";
import { Playlist } from "@/types/playlist";
import { User } from "@/types/auth";

type SearchType = "all" | "albums" | "tracks" | "playlists" | "users";
type SortOption = "relevance" | "newest" | "popular";

interface SearchResponse {
  albums: Album[];
  tracks: Track[];
  playlists: Playlist[];
  users: User[];
}

export function SearchBar() {
  const [query, setQuery] = useQueryState("q", {
    defaultValue: "",
    shallow: true,
  });
  const [type, setType] = useQueryState("type", {
    defaultValue: "all" as SearchType,
    shallow: true,
  });
  const [sort, setSort] = useQueryState("sort", {
    defaultValue: "relevance" as SortOption,
    shallow: true,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const debouncedValue = useDebounce(query, 500);
  const { addToHistory } = useSearchHistoryStore();
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const queryClient = useQueryClient();

  // 클릭 이벤트 핸들러 추가
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current && 
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["search", debouncedValue, type, sort],
    queryFn: async () => {
      if (!debouncedValue) return null;
      const response = await api.get<SearchResponse>(`/search`, {
        params: {
          q: debouncedValue,
          type,
          sort,
        },
      });
      return response.data;
    },
    enabled: Boolean(debouncedValue)
  });

  // 검색 실행 함수 수정
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    // 검색 상태 안정화를 위해 먼저 상태 업데이트
    setIsFocused(false);
    
    try {
      // 현재 검색 파라미터 유지
      const searchParams = {
        q: query.trim(),
        type: type || 'all',
        sort: sort || 'relevance'
      };

      // 검색 실행 전 prefetch
      await queryClient.prefetchInfiniteQuery({
        queryKey: ["search", searchParams.q, searchParams.type, searchParams.sort],
        queryFn: async ({ pageParam = 1 }) => {
          const { data } = await api.get("/search", {
            params: {
              ...searchParams,
              page: pageParam,
              limit: 20
            }
          });
          return data;
        },
        initialPageParam: 1,
      });

      // prefetch 완료 후에만 히스토리 추가
      addToHistory(searchParams.q);
      
      // URL 파라미터 구성
      const urlParams = new URLSearchParams();
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value) urlParams.set(key, value);
      });

      // 라우팅 실행
      router.push(`/search?${urlParams.toString()}`);
    } catch (error) {
      console.error("Search error:", error);
      // 에러 발생 시 상태 복구
      setIsFocused(true);
    }
  };

  // 자동완성 쿼리 수정
  const { data: suggestions } = useQuery({
    queryKey: ["suggestions", debouncedValue],
    queryFn: async () => {
      if (!debouncedValue) return [];
      const response = await api.get(`/search/suggest`, {
        params: { q: debouncedValue }
      });
      return response.data;
    },
    enabled: Boolean(debouncedValue) && debouncedValue.length > 1,
    staleTime: 1000 * 60, // 1분 동안 캐시 유지
  });

  // 검색 결과나 자동완성 결과가 있는지 확인
  const hasResults = Boolean(data) || Boolean(suggestions?.length);

  return (
    <div className="relative w-full max-w-2xl mx-auto" ref={searchContainerRef}>
      <div
        className={cn(
          "relative transition-all duration-300",
          ((isLoading || hasResults) || (isFocused && !query)) &&
            "rounded-t-2xl",
          !((isLoading || hasResults) || (isFocused && !query)) && "rounded-2xl"
        )}
      >
        <div className="relative backdrop-blur-xl bg-white/10 rounded-2xl overflow-hidden">
          <div className="flex items-center">
            <input
              type="text"
              name="search-bar"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              placeholder="검색어를 입력해주세요"
              className="flex-1 px-6 py-3 pl-12 bg-transparent text-white/90 
                       placeholder:text-white/60 focus:outline-none text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch(e); // Enter 키로 검색 시에도 히스토리 저장
                }
                if (e.key === 'Escape') {
                  setIsFocused(false);
                }
              }}
            />
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "px-4 text-white/60 hover:text-white/90 transition-colors",
                showFilters && "text-white/90"
              )}
            >
              <IconFilter size={18} />
            </button>
          </div>
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60">
            <IconSearch 
              size={18} 
              className="cursor-pointer"
              onClick={handleSearch}  // 검색 아이콘 클릭 시에도 히스토리 저장
            />
          </div>
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-12 top-1/2 -translate-y-1/2 text-white/60 
                       hover:text-white/90 transition-colors"
            >
              <IconX size={18} />
            </button>
          )}
        </div>

        {showFilters && (
          <SearchFilters
            type={type}
            sort={sort}
            onTypeChange={setType}
            onSortChange={setSort}
          />
        )}
      </div>

      {((isLoading || hasResults) || (isFocused && !query)) && (
        <div
          className="absolute w-full bg-black/40 backdrop-blur-xl 
                    rounded-b-2xl border border-white/10 shadow-2xl z-50
                    max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-track-white/5 
                    scrollbar-thumb-white/20 hover:scrollbar-thumb-white/30"
        >
          {isLoading ? (
            <div className="p-6 text-white/60 text-center">
              <div className="animate-pulse">검색 중...</div>
            </div>
          ) : query && isFocused ? (
            data ? (
              <SearchResults 
                data={data} 
                onClose={() => setIsFocused(false)}
              />
            ) : suggestions?.length ? (
              <SearchSuggestions 
                suggestions={suggestions} 
                onSelect={(text) => setQuery(text)} 
              />
            ) : null
          ) : isFocused ? (
            <SearchHistory onSelect={(query) => {
              addToHistory(query);
              router.push(`/search?q=${encodeURIComponent(query.trim())}`);
              setIsFocused(true);
            }} />
          ) : null}

          {/* "더 많은 결과 보기" 버튼 추가 */}
          {query && isFocused && data && (
            <div className="p-2 border-t border-white/10">
              <button
              onClick={(e) => {
                e.preventDefault();
                router.push(`/search?q=${encodeURIComponent(query.trim())}`);
                setIsFocused(false);
              }}
              className="w-full px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 
                text-sm text-white/80 hover:text-white transition-colors"
            >
              더 많은 결과 보기
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
