"use client";

import { IconHeart } from "@tabler/icons-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { likeApi, LikeableType, LIKE_KEYS } from "@/lib/api/like";
import { cn } from "@/lib/utils";

interface LikeButtonProps {
  type: LikeableType;
  id: string;
  className?: string;
  showCount?: boolean;
}

function formatLikeCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

export function LikeButton({
  type,
  id,
  className,
  showCount = false,
}: LikeButtonProps) {
  const queryClient = useQueryClient();
  const [isOptimistic, setIsOptimistic] = useState(false);

  const { data: likeStatus } = useQuery({
    queryKey: ["like-status", type, id],
    queryFn: () => likeApi.getStatus(type, id),
  });

  const { data: likeCount } = useQuery({
    queryKey: ["like-count", type, id],
    queryFn: () => likeApi.getCount(type, id),
    enabled: showCount,
  });

  const { mutate: toggleLike } = useMutation({
    mutationFn: () => likeApi.toggle(type, id),
    onMutate: () => {
      setIsOptimistic(true);
    },
    onSettled: () => {
      setIsOptimistic(false);
      queryClient.invalidateQueries({ queryKey: ["like-status", type, id] });
      queryClient.invalidateQueries({ queryKey: ["like-count", type, id] });
      queryClient.invalidateQueries({ queryKey: LIKE_KEYS.all });
    },
  });

  const isLiked = isOptimistic ? !likeStatus?.isLiked : likeStatus?.isLiked;

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleLike();
        }}
        className={cn(
          "group relative flex h-8 w-8 items-center justify-center rounded-full",
          "transition-all duration-300 hover:bg-white/10",
          isLiked && "bg-purple-500/0",
          !showCount && className
        )}
      >
        <div className="relative">
          <IconHeart
            size={18}
            className={cn(
              "transition-all duration-300 transform",
              isLiked
                ? "text-purple-400 scale-110"
                : "text-white/60 group-hover:text-white/80"
            )}
            fill={isLiked ? "currentColor" : "none"}
            stroke={isLiked ? "none" : "currentColor"}
            strokeWidth={1.5}
          />
          
          {isOptimistic && (
            <div className="absolute inset-0 animate-ping rounded-full 
                           bg-purple-500/20 duration-300" />
          )}
        </div>

        {isLiked && (
          <div className="absolute inset-0 rounded-full bg-gradient-to-r 
                         from-purple-500/10 to-pink-500/10 animate-pulse" />
        )}
      </button>

      {showCount && (
        <span
          className={cn(
            "text-xs font-medium transition-all duration-300",
            isLiked 
              ? "text-purple-400" 
              : "text-white/60"
          )}
        >
          {formatLikeCount(likeCount?.count || 0)}
        </span>
      )}
    </div>
  );
}
