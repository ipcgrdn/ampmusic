"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { followApi, PaginatedFollowers } from "@/lib/api/follow";
import Image from "next/image";
import Link from "next/link";
import { getImageUrl } from "@/lib/utils";
import { FollowButton } from "../common/FollowButton";
import { IconUsers, IconUserOff, IconSearch, IconX, IconArrowLeft } from "@tabler/icons-react";
import { Loader2, AlertCircle } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { Button } from "@/components/ui/button";

interface FollowersModalProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function FollowersModal({ userId, isOpen, onClose }: FollowersModalProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery);

  // queryClient 가져오기
  const queryClient = useQueryClient();
  
  const { data, isLoading, error } = useQuery<PaginatedFollowers>({
    queryKey: ["followers", userId],
    queryFn: () => followApi.getFollowers(userId),
    enabled: isOpen,
    // 모달이 열릴 때마다 새로운 데이터를 가져오도록 설정
    refetchOnMount: true,
    // 캐시된 데이터를 사용하지 않도록 설정
    refetchOnWindowFocus: false,
  });

  // 모달이 닫힐 때 cleanup 함수
  const handleCloseModal = () => {
    setSearchQuery("");
    // 캐시된 데이터 제거
    queryClient.removeQueries({ queryKey: ["followers", userId] });
    onClose();
  };

  const parentRef = useRef<HTMLDivElement>(null);

  const filteredFollowers = useMemo(() => {
    if (!data?.followers) return [];
    return data.followers.filter(follower => 
      follower.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      follower.bio?.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [data?.followers, debouncedSearch]);

  const rowVirtualizer = useVirtualizer({
    count: filteredFollowers.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 76, // 각 팔로워 아이템의 대략적인 높이
    overscan: 5,
  });

  const renderError = () => {
    const isNotFound = error instanceof Error && error.message.includes('찾을 수 없습니다');

    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-12 text-white/60"
      >
        <div className="relative mb-4">
          <AlertCircle className="w-12 h-12 text-red-400" />
          <IconUserOff className="w-6 h-6 absolute bottom-0 right-0 text-red-400/80" />
        </div>
        <p className="text-lg font-medium mb-2">
          {isNotFound ? '사용자를 찾을 수 없습니다.' : '팔로워 목록을 불러오지 못했습니다.'}
        </p>
        <p className="text-sm text-white/40 mb-4">
          {isNotFound 
            ? '해당 사용자가 존재하지 않거나 삭제되었을 수 있습니다.'
            : '잠시 후 다시 시도해주세요.'}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
        >
          다시 시도하기
        </button>
      </motion.div>
    );
  };

  const renderSearchBar = () => (
    <div className="relative my-4">
      <Input
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="팔로워 검색..."
        className="bg-white/5 border-white/10 text-white placeholder:text-white/40 pr-20"
        autoFocus={false}
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="p-1 hover:bg-white/10 rounded-full transition-colors"
          >
            <IconX className="w-4 h-4 text-white/40" />
          </button>
        )}
        <IconSearch className="w-5 h-5 text-white/40" />
      </div>
    </div>
  );

  const renderEmptySearch = () => {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="flex flex-col items-center justify-center h-[50vh] text-white/60"
      >
        <div className="relative w-16 h-16 mb-4">
          <div className="absolute inset-0 bg-white/5 rounded-full animate-ping" />
          <div className="relative flex items-center justify-center w-16 h-16 bg-white/10 rounded-full">
            <IconSearch className="w-8 h-8" />
          </div>
        </div>
        <p className="text-lg mb-2">검색 결과가 없습니다</p>
        <p className="text-sm text-white/40 mb-6">다른 검색어로 시도해보세요</p>
        <Button
          variant="ghost"
          size="lg"
          onClick={() => setSearchQuery("")}
          className="gap-2 text-white/60 hover:text-white hover:bg-white/10 bg-white/5"
        >
          <IconArrowLeft className="w-5 h-5" />
          전체 목록으로 돌아가기
        </Button>
      </motion.div>
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-white/60">
          <Loader2 className="w-8 h-8 animate-spin mb-2" />
          <p>팔로워 목록을 불러오는 중...</p>
        </div>
      );
    }

    if (error) {
      return renderError();
    }

    if (!data?.followers.length) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-white/60">
          <IconUserOff className="w-8 h-8 mb-2" />
          <p>아직 팔로워가 없습니다.</p>
        </div>
      );
    }

    if (filteredFollowers.length === 0 && searchQuery) {
      return renderEmptySearch();
    }

    return (
      <div 
        ref={parentRef}
        className={cn(
          "relative overflow-y-auto px-2",
          "scrollbar-thin scrollbar-track-white/5 scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20",
          isMobile ? "h-[calc(85vh-10rem)]" : "h-[65vh]",
          "touch-pan-y overscroll-y-contain"
        )}
      >
        {renderSearchBar()}
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const follower = filteredFollowers[virtualRow.index];
            return (
              <motion.div
                key={follower.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: virtualRow.index * 0.05 }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: virtualRow.size,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                className="py-1"
              >
                <div className="group relative backdrop-blur-md bg-white/5 rounded-lg p-3 border border-white/5 
                             hover:bg-white/10 hover:border-white/10 transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-[#e6c200]/5 
                                opacity-0 group-hover:opacity-100 rounded-lg transition-opacity duration-300" />
                  
                  <div className="relative flex items-center justify-between gap-4">
                    <Link
                      href={`/${follower.id}`}
                      className="flex items-center gap-3 flex-1 min-w-0"
                    >
                      <div className="relative h-12 w-12 rounded-full overflow-hidden bg-white/5">
                        <Image
                          src={getImageUrl(follower.avatar)}
                          alt={follower.name}
                          fill
                          sizes="48px"
                          priority={virtualRow.index < 4}
                          loading={virtualRow.index < 4 ? "eager" : "lazy"}
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-white truncate group-hover:text-[#e6c200] transition-colors">
                          {follower.name}
                        </div>
                        {follower.bio && (
                          <div className="text-sm text-white/60 truncate group-hover:text-white/70 transition-colors">
                            {follower.bio}
                          </div>
                        )}
                      </div>
                    </Link>
                    <FollowButton userId={follower.id} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open: boolean) => {
        if (!open) {
          handleCloseModal();
        }
      }}
    >
      <DialogContent 
        className={cn(
          "bg-black/40 backdrop-blur-xl border-white/10",
          isMobile ? "w-full h-[80vh] mt-auto mb-0 rounded-t-xl" : "max-w-md"
        )}
        initial={isMobile ? { y: "100%" } : { scale: 0.95, opacity: 0 }}
        animate={isMobile ? { y: 0 } : { scale: 1, opacity: 1 }}
        exit={isMobile ? { y: "100%" } : { scale: 0.95, opacity: 0 }}
        transition={{ type: "spring", duration: 0.5 }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-[#e6c200]/5 rounded-lg pointer-events-none" />
        
        {isMobile && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-white/20" />
        )}

        <DialogHeader className="relative">
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-white">
            <IconUsers className="w-5 h-5 text-white/60" />
            팔로워
            {data?.total ? (
              <span className="text-base font-normal text-white/60">
                {data.total}
              </span>
            ) : null}
          </DialogTitle>
        </DialogHeader>
        
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
} 