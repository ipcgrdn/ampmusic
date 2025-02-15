"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { MobileNav } from "./mobile-nav";
import { AudioPlayer } from "../player/audio-player";
import { SearchBar } from "../search/SearchBar";
import { useSocket } from '@/hooks/use-socket';

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuth = pathname === "/auth";

  // Socket 연결 초기화
  useSocket();

  if (isAuth) {
    return children;
  }

  return (
    <div className="flex min-h-screen bg-black">
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      <div className="flex-1 lg:ml-60">
        <div className="px-4 py-4">
          <SearchBar />
        </div>
        <div className="pb-20 lg:mb-0 mb-16">{children}</div>
      </div>
      <MobileNav />
      <AudioPlayer />
    </div>
  );
}
