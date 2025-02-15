"use client";

import { IconClock, IconX } from "@tabler/icons-react";
import { useSearchHistoryStore } from "@/lib/store/search-history-store";

interface SearchHistoryProps {
  onSelect: (query: string) => void;
}

export function SearchHistory({ onSelect }: SearchHistoryProps) {
  const { history, removeFromHistory, clearHistory } = useSearchHistoryStore();

  if (history.length === 0) return null;

  return (
    <div className="p-2 space-y-1">
      <div className="flex items-center justify-between px-2 py-1">
        <h3 className="text-xs font-medium text-white/60">최근 검색</h3>
        <button
          onClick={(e) => {
            e.stopPropagation();
            clearHistory();
          }}
          className="text-xs text-white/40 hover:text-white/60 transition-colors"
        >
          모두 삭제
        </button>
      </div>
      {history.map((query) => (
        <div
          key={query}
          className="flex items-center justify-between group px-3 py-2 rounded-lg 
                   hover:bg-white/5 transition-colors cursor-pointer"
        >
          <div
            className="flex items-center gap-3 flex-1"
            onClick={() => onSelect(query)}
          >
            <IconClock size={14} className="text-white/40" />
            <span className="text-sm text-white/80">{query}</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              removeFromHistory(query);
            }}
            className="opacity-0 group-hover:opacity-100 text-white/40 
                     hover:text-white/60 transition-all"
          >
            <IconX size={14} />
          </button>
        </div>
      ))}
    </div>
  );
} 