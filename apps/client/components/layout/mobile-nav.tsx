"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MAIN_NAV_ITEMS } from "@/constants/navigation";
import { useAuth } from "@/context/auth-context";
import Image from "next/image";
import { motion } from 'framer-motion';
import { IconBell } from "@tabler/icons-react";
import { useState } from "react";
import { NotificationModal } from "../notification/notification-modal";
import { useNotificationStore } from "@/store/notification-store";

export function MobileNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const { unreadCount } = useNotificationStore();

  return (
    <>
      <motion.nav 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-lg border-t border-white/5"
      >
        <div className="flex items-center justify-around h-16">
          {MAIN_NAV_ITEMS.map(({ href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors
                ${
                  pathname === href
                    ? "text-white"
                    : "text-gray-400 hover:text-white"
                }`}
            >
              <Icon className="w-6 h-6" stroke={1.5} />
            </Link>
          ))}

          <button
            onClick={() => setIsNotificationOpen(true)}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors text-gray-400 hover:text-white relative"
          >
            <div className="relative">
              <IconBell className="w-6 h-6" stroke={1.5} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full text-[10px] flex items-center justify-center">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </div>
          </button>

          {user && (
            <Link
              href={`/${user.id}`}
              className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors text-gray-400 hover:text-white"
            >
              <Image
                src={user.avatar}
                alt={user.name}
                width={30}
                height={30}
                className="relative rounded-full ring-2 ring-white/20"
                quality={85}
                priority
              />
            </Link>
          )}
        </div>
      </motion.nav>

      <NotificationModal 
        open={isNotificationOpen} 
        onOpenChange={setIsNotificationOpen}
      />
    </>
  );
}
