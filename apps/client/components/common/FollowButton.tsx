"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { followApi } from "@/lib/api/follow";
import { cn } from "@/lib/utils";
import { IconUserPlus, IconCheck } from "@tabler/icons-react";
import { useToast } from "@/components/ui/toast";

interface FollowButtonProps {
  userId: string;
  className?: string;
  showCount?: boolean;
}

export function FollowButton({ userId, className, showCount = false }: FollowButtonProps) {
  const queryClient = useQueryClient();
  const [isOptimistic, setIsOptimistic] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { showToast } = useToast();

  const { data: followStatus } = useQuery({
    queryKey: ["follow-status", userId],
    queryFn: () => followApi.getStatus(userId),
  });

  const { data: followCounts } = useQuery({
    queryKey: ["follow-counts", userId],
    queryFn: () => followApi.getCounts(userId),
    enabled: showCount,
  });

  const { mutate: toggleFollow, isPending } = useMutation({
    mutationFn: () => followApi.toggle(userId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["follow-status", userId] });
      await queryClient.cancelQueries({ queryKey: ["follow-counts", userId] });
      
      const previousStatus = queryClient.getQueryData(["follow-status", userId]);
      const willFollow = !(previousStatus as any)?.isFollowing;
      
      // Optimistic update
      queryClient.setQueryData(["follow-status", userId], (old: any) => ({
        ...old,
        isFollowing: willFollow
      }));
      
      setIsOptimistic(true);
      
      return { previousStatus, willFollow };
    },
    onError: (_err, _variables, context) => {
      queryClient.setQueryData(["follow-status", userId], context?.previousStatus);
      setIsOptimistic(false);
      showToast("작업을 완료할 수 없습니다.", "error");
    },
    onSuccess: (_data, _variables, context) => {
      console.log('Follow toggle response:', _data);
      // context에서 의도했던 상태 변경을 가져와서 사용
      const willFollow = context?.willFollow;
      showToast(
        willFollow ? "팔로우했습니다." : "팔로우를 취소했습니다.",
        "success"
      );
    },
    onSettled: () => {
      setIsOptimistic(false);
      queryClient.invalidateQueries({
        queryKey: [["follow-status", userId], ["follow-counts", userId], ["followers", userId]]
      });
    },
  });

  const isFollowing = isOptimistic ? !followStatus?.isFollowing : followStatus?.isFollowing;

  const handleClick = () => {
    if (isPending) return;
    toggleFollow();
  };

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      disabled={isPending}
      aria-label={isFollowing ? "팔로우 취소" : "팔로우"}
      title={isFollowing ? "팔로우 취소" : "팔로우"}
      className={cn(
        "group relative flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300",
        "backdrop-blur-md border",
        isFollowing
          ? "bg-white/5 border-white/10 hover:bg-red-500/10 hover:border-red-500/20"
          : "bg-purple-500/10 border-purple-500/20 hover:bg-purple-500/20",
        className
      )}
    >
      <div className={cn(
        "relative flex items-center gap-2 transition-all duration-300",
        isFollowing && isHovered && "text-red-400"
      )}>
        {isFollowing ? (
          <>
            <IconCheck 
              size={18} 
              className={cn(
                "transition-all duration-300",
                isHovered ? "opacity-0 scale-0" : "opacity-100 scale-100"
              )} 
            />
            <IconUserPlus
              size={18}
              className={cn(
                "absolute left-0 transition-all duration-300",
                isHovered ? "opacity-100 scale-100" : "opacity-0 scale-0"
              )}
            />
            <span className="text-sm font-medium">
              {isHovered ? "언팔로우" : "팔로잉"}
            </span>
          </>
        ) : (
          <>
            <IconUserPlus size={18} />
            <span className="text-sm font-medium">팔로우</span>
          </>
        )}
      </div>

      {showCount && followCounts && (
        <div className={cn(
          "ml-1 text-sm transition-all duration-300",
          isFollowing 
            ? "text-white/60" 
            : "text-purple-300"
        )}>
          {followCounts.followers.toLocaleString()}
        </div>
      )}

      {/* 배경 효과 */}
      <div className={cn(
        "absolute inset-0 rounded-full opacity-0 transition-opacity duration-300",
        "bg-gradient-to-r from-purple-500/10 to-pink-500/10",
        !isFollowing && "group-hover:opacity-100"
      )} />
    </button>
  );
} 