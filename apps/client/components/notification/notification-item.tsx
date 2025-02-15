import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import Image from "next/image";
import Link from "next/link";
import { Notification } from "@/types/notification";
import { useMarkNotificationAsRead, useDeleteNotification } from "@/hooks/use-notification";
import { getNotificationLink, getNotificationMessage } from "@/lib/utils/notification";
import { cn } from "@/lib/utils";
import { IconX } from "@tabler/icons-react";

interface NotificationItemProps {
  notification: Notification;
}

export function NotificationItem({ notification }: NotificationItemProps) {
  const { mutate: markAsRead } = useMarkNotificationAsRead();
  const { mutate: deleteNotification } = useDeleteNotification();

  const handleClick = () => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
  };

  return (
    <div
      className={cn(
        "block rounded-xl",
        "transform-gpu transition-all duration-200 group",
        "hover:bg-white/[0.03] hover:scale-[1.02]",
        "will-change-transform",
        "border border-transparent hover:border-white/[0.08]",
        !notification.isRead && "bg-gradient-to-r from-white/[0.03] to-transparent border-white/[0.08]"
      )}
    >
      <Link
        href={getNotificationLink(notification)}
        onClick={handleClick}
        className="block"
      >
        <div className="flex items-start gap-3 p-4">
          <div className="relative shrink-0">
            <div className={cn(
              "absolute -inset-1 rounded-full blur-sm opacity-50",
              !notification.isRead && "bg-gradient-to-r from-[#e6c200]/40 to-[#533483]/40"
            )} />
            <Image
              src={notification.actor.avatar}
              alt={notification.actor.name}
              width={40}
              height={40}
              className={cn(
                "relative rounded-full ring-2",
                !notification.isRead ? "ring-white/20" : "ring-white/10"
              )}
            />
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <p className={cn(
              "text-sm leading-relaxed",
              !notification.isRead ? "text-white/95" : "text-white/80"
            )}>
              <span className="font-medium hover:text-white">
                {notification.actor.name}
              </span>
              {" "}
              {getNotificationMessage(notification)}
            </p>
            <p className="text-xs text-white/40">
              {formatDistanceToNow(new Date(notification.createdAt), {
                addSuffix: true,
                locale: ko,
              })}
            </p>
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              deleteNotification(notification.id);
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-white/10 rounded-full self-start -mt-1 -mr-1"
          >
            <IconX className="w-3.5 h-3.5 text-white/40 hover:text-white" />
          </button>
        </div>
      </Link>
    </div>
  );
}

// 알림 타입별 메시지 및 링크 생성 헬퍼 함수들은 별도로 구현 필요 