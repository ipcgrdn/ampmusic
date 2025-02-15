"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  IconUser, 
  IconBell, 
  IconLock, 
  IconBuildingStore,
} from "@tabler/icons-react";

const settingsMenu = [
  {
    title: "계정",
    href: "/settings/account",
    icon: IconUser,
  },
  {
    title: "알림",
    href: "/settings/notifications",
    icon: IconBell,
  },
  {
    title: "개인정보",
    href: "/settings/privacy",
    icon: IconLock,
  },
  {
    title: "소개",
    href: "/settings/about",
    icon: IconBuildingStore,
  },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen px-8">
      {/* 배경 그라데이션 효과 - z-index 조정 */}
      <div className="fixed inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 -z-10" />

      <div className="relative">

        {/* 메인 컨텐츠 */}
        <div className="container py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* 사이드바 */}
            <aside className="w-full lg:w-56 shrink-0">
              <nav className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-2">
                {settingsMenu.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "relative group",
                        "rounded-xl p-4 transition-all duration-300",
                        "border border-white/[0.08] hover:border-white/[0.15]",
                        isActive
                          ? "bg-white/[0.08] hover:bg-white/[0.10]"
                          : "bg-white/[0.02] hover:bg-white/[0.06]"
                      )}
                    >
                      {/* 호버 시 보여질 그라데이션 효과 */}
                      <div
                        className={cn(
                          "absolute -inset-[1px] rounded-xl opacity-0 group-hover:opacity-100",
                          "bg-gradient-to-r from-indigo-500/10 to-purple-500/10",
                          "transition-opacity duration-500 blur-xl",
                          isActive && "opacity-100"
                        )}
                      />

                      <div className="relative flex items-start gap-4">
                        <Icon
                          className={cn(
                            "w-5 h-5 mt-0.5",
                            isActive
                              ? "text-purple-400"
                              : "text-white/40 group-hover:text-white/60"
                          )}
                        />
                        <div>
                          <h2 className="font-medium text-sm text-white/90">
                            {item.title}
                          </h2>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </nav>
            </aside>

            {/* 컨텐츠 영역 */}
            <main className="flex-1 min-w-0">
              <div className="relative group">
                {/* 배경 그라데이션 효과 */}
                <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />

                <div className="relative rounded-xl border border-white/[0.08] hover:border-white/[0.15] bg-white/[0.02] hover:bg-white/[0.04] backdrop-blur-xl p-6 transition-colors duration-300">
                  {children}
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
