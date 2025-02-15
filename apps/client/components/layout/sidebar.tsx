"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { IconBell, IconHeart, IconSettings } from "@tabler/icons-react";
import { MAIN_NAV_ITEMS, NavItem as NavItemType } from "@/constants/navigation";
import { usePlayerStore } from "@/lib/store/player-store";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { NotificationModal } from "../notification/notification-modal";
import { useNotificationStore } from "@/store/notification-store";
import { useQuery } from "@tanstack/react-query";
import { getUserPlaylists } from "@/lib/api/playlist";

// 네비게이션 아이템 컴포넌트
function NavItem({ href, label, icon: Icon }: NavItemType) {
  const pathname = usePathname();

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200
        ${
          pathname === href
            ? "bg-white/20 text-white backdrop-blur-sm shadow-lg"
            : "text-gray-300 hover:text-white hover:bg-white/10"
        }`}
    >
      <Icon className="w-5 h-5" stroke={1.5} />
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
}

export function Sidebar() {
  const { user, isLoading } = useAuth();
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const { unreadCount: notificationCount } = useNotificationStore();

  // 내 플레이리스트 가져오기
  const { data: playlists } = useQuery({
    queryKey: ["my-playlists"],
    queryFn: () => getUserPlaylists(user?.id as string),
    enabled: !!user,
  });

  return (
    <aside className="fixed left-0 top-0 w-60 h-screen bg-black/30 backdrop-blur-xl border-r border-white/5">
      {/* Logo Section */}
      <div className="p-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute -inset-2 bg-gradient-to-r from-[#e6c200] to-[#533483] rounded-full blur-xl opacity-70" />
            <Image
              src="/logo.png"
              alt="AMP"
              width={32}
              height={32}
              className="relative rounded-xl"
              priority
            />
          </div>
          <span className="text-lg font-semibold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            AMP
          </span>
        </Link>
      </div>

      {/* Main Navigation */}
      <div className="px-3">
        <nav className="space-y-1">
          {MAIN_NAV_ITEMS.map((item) => (
            <NavItem key={item.href} {...item} />
          ))}
        </nav>
      </div>

      {/* Notification Button */}
      <div className="px-3 mt-1">
        <button
          onClick={() => setIsNotificationOpen(true)}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200 relative"
        >
          <div className="relative">
            <IconBell className="w-5 h-5" stroke={1.5} />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full text-[10px] flex items-center justify-center">
                {notificationCount > 99 ? "99+" : notificationCount}
              </span>
            )}
          </div>
          <span className="text-sm font-medium">알림</span>
        </button>
      </div>

      {/* 구분선 */}
      <div className="h-px w-full bg-white/10 my-3" />

      {/* Library Section - 좋아요 + 플레이리스트 */}
      <div className="px-3 mt-1">
        <nav className="space-y-1">
          <NavItem href="/likes" label="좋아요" icon={IconHeart} />

          {/* 내 플레이리스트 목록 */}
          {playlists?.map((playlist) => (
            <Link
              key={playlist.id}
              href={`/playlist/${playlist.id}`}
              className={cn(
                "flex items-center gap-3 w-full px-4 py-2.5",
                "rounded-lg text-gray-300 hover:text-white",
                "hover:bg-white/10 transition-all duration-200"
              )}
            >
              <Image
                src={`${process.env.NEXT_PUBLIC_API_URL}${playlist.coverImage}`}
                alt={playlist.title}
                width={24}
                height={24}
                className="rounded-lg"
              />
              <span className="text-sm font-medium truncate">
                {playlist.title}
              </span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="absolute bottom-0 left-0 right-0">
        <div
          className={cn(
            "p-3 border-t border-white/[0.02]",
            currentTrack && "pb-[88px]"
          )}
        >
          {/* 설정 버튼 */}
          <div className="mb-3">
            <NavItem href="/settings" label="설정" icon={IconSettings} />
          </div>

          {/* 로딩 상태일 때는 스켈레톤 UI 표시 */}
          {isLoading ? (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 backdrop-blur-md border border-white/10">
              <div className="w-9 h-9 rounded-full bg-white/10 animate-pulse" />
              <div className="flex-1">
                <div className="h-4 w-24 bg-white/10 rounded animate-pulse mb-2" />
                <div className="h-3 w-16 bg-white/10 rounded animate-pulse" />
              </div>
            </div>
          ) : (
            user && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all duration-200">
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-[#e6c200] to-[#533483] rounded-full blur opacity-75" />
                  <Link href={`/${user.id}`}>
                    <Image
                      src={user.avatar}
                      alt={user.name}
                      width={36}
                      height={36}
                      className="relative rounded-full ring-2 ring-white/20"
                    />
                  </Link>
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={`/${user.id}`}>
                    <p className="text-sm font-medium truncate text-white/90">
                      {user.name}
                    </p>
                  </Link>
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* Notification Modal */}
      <NotificationModal
        open={isNotificationOpen}
        onOpenChange={setIsNotificationOpen}
      />
    </aside>
  );
}
