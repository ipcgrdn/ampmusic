"use client";

import { cn } from "@/lib/utils";
import {
  IconDisc,
  IconMusic,
  IconPlaylist,
  IconUser,
  IconLayoutGrid,
  IconClock,
  IconTrendingUp,
  IconStar,
} from "@tabler/icons-react";

interface SearchFiltersProps {
  type: string;
  sort: string;
  onTypeChange: (type: string) => void;
  onSortChange: (sort: string) => void;
}

const types = [
  { id: "all", label: "전체", icon: IconLayoutGrid },
  { id: "albums", label: "앨범", icon: IconDisc },
  { id: "tracks", label: "트랙", icon: IconMusic },
  { id: "playlists", label: "플레이리스트", icon: IconPlaylist },
  { id: "users", label: "아티스트", icon: IconUser },
];

const sorts = [
  { id: "relevance", label: "관련성", icon: IconStar },
  { id: "newest", label: "최신순", icon: IconClock },
  { id: "popular", label: "인기순", icon: IconTrendingUp },
];

export function SearchFilters({
  type,
  sort,
  onTypeChange,
  onSortChange,
}: SearchFiltersProps) {
  return (
    <div className="p-4 space-y-4 border-t border-white/10 backdrop-blur-xl bg-black/20">
      <div className="space-y-2">
        <p className="text-xs font-medium text-white/60">필터</p>
        <div className="flex flex-wrap gap-2">
          {types.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onTypeChange(item.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all",
                  "hover:bg-white/10",
                  type === item.id
                    ? "bg-white/20 text-white"
                    : "text-white/60"
                )}
              >
                <Icon size={16} />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-white/60">정렬</p>
        <div className="flex flex-wrap gap-2">
          {sorts.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onSortChange(item.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all",
                  "hover:bg-white/10",
                  sort === item.id
                    ? "bg-white/20 text-white"
                    : "text-white/60"
                )}
              >
                <Icon size={16} />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
} 