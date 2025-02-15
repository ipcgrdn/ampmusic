"use client";

import { useQuery } from "@tanstack/react-query";
import { getFollowingUpdates } from "@/lib/api/user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { IconDisc, IconPlaylist, IconChevronDown } from "@tabler/icons-react";
import { useState } from "react";

export function FollowingUpdates() {
  const [displayCount, setDisplayCount] = useState(5);

  const { data: updates, isLoading } = useQuery({
    queryKey: ["following-updates"],
    queryFn: getFollowingUpdates,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-[120px] rounded-xl bg-white/5 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!updates?.length) {
    return (
      <div className="text-center text-white/60 py-8">
        팔로우한 유저들의 업데이트가 없습니다
      </div>
    );
  }

  const displayedUpdates = updates.slice(0, displayCount);
  const hasMore = updates.length > displayCount;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedUpdates.map((update, index) => (
          <Link
            key={index}
            href={`/${update.type.toLowerCase()}/${update.item.id}`}
            className="group relative rounded-xl bg-white/[0.03] border border-white/10 
                  hover:bg-white/[0.05] hover:border-white/20 transition-all duration-300 overflow-hidden"
          >
            <div className="flex gap-4 p-4">
              <div className="relative w-20 h-20 rounded-lg overflow-hidden">
                <Image
                  src={`${process.env.NEXT_PUBLIC_API_URL}${update.item.coverImage}`}
                  alt={update.item.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {update.type === "ALBUM" ? (
                    <IconDisc size={16} className="text-emerald-400" />
                  ) : (
                    <IconPlaylist size={16} className="text-blue-400" />
                  )}
                  <span className="text-sm text-white/60">
                    {update.type === "ALBUM" ? "새 앨범" : "새 플레이리스트"}
                  </span>
                </div>
                <h3 className="font-medium text-white truncate">
                  {update.item.title}
                </h3>
                <div className="flex items-center gap-2 mt-2">
                  <Avatar className="w-5 h-5">
                    <AvatarImage src={update.user.avatar} />
                    <AvatarFallback>{update.user.name[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-white/60">
                    {update.user.name}
                  </span>
                  <span className="text-sm text-white/40">•</span>
                  <span className="text-sm text-white/40">
                    {formatDistanceToNow(new Date(update.createdAt), {
                      addSuffix: true,
                      locale: ko,
                    })}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button
            variant="ghost"
            className="text-white/60 hover:text-white hover:bg-white/10"
            onClick={() => setDisplayCount((prev) => prev + 10)}
          >
            <IconChevronDown className="w-4 h-4 mr-2" />
            더보기
          </Button>
        </div>
      )}
    </div>
  );
}
