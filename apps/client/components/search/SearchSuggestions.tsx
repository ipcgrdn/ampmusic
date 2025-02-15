"use client";

import { IconMusic, IconDisc, IconPlaylist, IconUser } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface Suggestion {
  text: string;
  type: string;
  score: number;
}

interface SearchSuggestionsProps {
  suggestions: Suggestion[];
  onSelect: (text: string) => void;
  className?: string;
}

const typeIcons = {
  albums: IconDisc,
  tracks: IconMusic,
  playlists: IconPlaylist,
  users: IconUser,
};

export function SearchSuggestions({ suggestions, onSelect, className }: SearchSuggestionsProps) {
  if (suggestions.length === 0) return null;

  return (
    <div className={cn("p-2 space-y-1", className)}>
      {suggestions.map((suggestion, index) => {
        const Icon = typeIcons[suggestion.type as keyof typeof typeIcons];
        
        return (
          <div
            key={`${suggestion.text}-${index}`}
            className="flex items-center gap-3 px-3 py-2 rounded-lg 
                     hover:bg-white/5 transition-colors cursor-pointer"
            onClick={() => onSelect(suggestion.text)}
          >
            {Icon && <Icon size={14} className="text-white/40" />}
            <span className="text-sm text-white/80">{suggestion.text}</span>
            <span className="text-xs text-white/40 ml-auto">
              {suggestion.type}
            </span>
          </div>
        );
      })}
    </div>
  );
} 