import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "../ui/scroll-area";
import { NotificationItem } from "./notification-item";
import { Loader2 } from "lucide-react";
import { IconCheck, IconTrash } from "@tabler/icons-react";
import {
  useNotifications,
  useMarkAllNotificationsAsRead,
  useDeleteAllNotifications,
} from "@/hooks/use-notification";
import { Button } from "@/components/ui/button";
import { useNotificationStore } from "@/store/notification-store";
import { useMemo } from "react";

interface NotificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NotificationModal({
  open,
  onOpenChange,
}: NotificationModalProps) {
  const {
    data,
    isLoading,
    hasNextPage: hasMore,
    fetchNextPage,
    isError,
    error,
  } = useNotifications();
  const { notifications: realtimeNotifications } = useNotificationStore();
  const { mutate: markAllAsRead, isPending } = useMarkAllNotificationsAsRead();
  const { mutate: deleteAll, isPending: isDeleting } =
    useDeleteAllNotifications();

  // 실시간 알림과 기존 알림 합치기
  const allNotifications = useMemo(() => {
    const existingNotifications =
      data?.pages.flatMap((page) => page.notifications) ?? [];
    return [...realtimeNotifications, ...existingNotifications];
  }, [data?.pages, realtimeNotifications]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight * 1.5) {
      fetchNextPage();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] h-[80vh] flex flex-col p-0 bg-black/40 backdrop-blur-xl border-white/10 z-[9999]">
        <div className="p-6 border-b border-white/[0.08] bg-white/[0.02]">
          <div className="flex items-center justify-between gap-4">
            <DialogTitle className="text-xl font-semibold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
              알림
            </DialogTitle>
            <div className="flex flex-1 items-center gap-2 mx-auto">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => markAllAsRead()}
                disabled={isPending || !allNotifications.length}
                className="h-8 w-8 rounded-full hover:bg-white/5 hover:border hover:border-white/75 transition-all duration-200"
              >
                <IconCheck className="h-4 w-4 text-white/60" />
                <span className="sr-only">모두 읽음</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  deleteAll();
                }}
                disabled={isDeleting || !allNotifications.length}
                className="h-8 w-8 rounded-full hover:bg-white/5 hover:border hover:border-white/75 transition-all duration-200"
              >
                <IconTrash className="h-4 w-4 text-white/60" />
                <span className="sr-only">모두 삭제</span>
              </Button>
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1 px-2" onScroll={handleScroll}>
          <div className="space-y-2 py-2">
            {isLoading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin text-white/40" />
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center justify-center py-12 text-white/40">
                <p className="text-sm">알림을 불러오는데 실패했습니다.</p>
                <p className="text-xs mt-1">{error.message}</p>
              </div>
            ) : allNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-white/40">
                <p className="text-sm">알림이 없습니다</p>
              </div>
            ) : (
              allNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                />
              ))
            )}

            {hasMore && (
              <div className="flex justify-center p-4">
                <Loader2 className="w-4 h-4 animate-spin text-white/40" />
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
