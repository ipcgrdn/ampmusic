import type { Notification, NotificationPage } from "@/types/notification";

import { api } from "@/lib/axios";
import { InfiniteData, useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// 알림 목록 조회 (무한 스크롤)
export function useNotifications(limit: number = 20) {
  return useInfiniteQuery({
    queryKey: ["notifications"],
    queryFn: async ({ pageParam }) => {
      const { data } = await api.get<NotificationPage>("/notifications", {
        params: { page: pageParam, limit },
      });
      return data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.hasMore) return undefined;
      return allPages.length + 1;
    },
    // 성능 최적화 옵션 추가
    staleTime: 1000 * 60 * 5, // 5분
    gcTime: 1000 * 60 * 10,   // 10분
    select: (data) => ({
      pages: data.pages,
      pageParams: data.pageParams,
    }),
  });
}

// 읽지 않은 알림 수 조회 최적화
export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: ["notifications", "unread"],
    queryFn: async () => {
      try {
        const { data } = await api.get<{ count: number }>("/notifications/unread/count");
        return data.count;
      } catch (error) {
        console.error("Failed to fetch unread count:", error);
        return 0; // 에러 발생시 기본값 반환
      }
    },
    staleTime: 1000 * 30, // 30초
    gcTime: 1000 * 60,    // 1분
    retry: false,         // 실패시 재시도 하지 않음
  });
}

// 알림 읽음 처리
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { data } = await api.patch<Notification>(
        `/notifications/${notificationId}/read`
      );
      return data;
    },
    onSuccess: (updatedNotification) => {
      // 캐시 업데이트
      queryClient.setQueryData<Notification[]>(
        ["notifications"],
        (old) => old?.map(notification =>
          notification.id === updatedNotification.id
            ? updatedNotification
            : notification
        )
      );
      // 읽지 않은 알림 수 갱신
      queryClient.invalidateQueries({
        queryKey: ["notifications", "unread"],
      });
    },
  });
}

// 알림 삭제
export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      await api.delete(`/notifications/${notificationId}`);
      return notificationId;
    },
    onSuccess: (deletedId) => {
      // 캐시의 모든 페이지에서 삭제된 알림 제거
      queryClient.setQueryData<InfiniteData<NotificationPage>>(
        ["notifications"],
        (old) => {
          if (!old) return old;
          
          return {
            ...old,
            pages: old.pages.map(page => ({
              ...page,
              notifications: page.notifications.filter(n => n.id !== deletedId)
            }))
          };
        }
      );

      // 읽지 않은 알림 수 갱신
      queryClient.invalidateQueries({
        queryKey: ["notifications", "unread"],
      });
    },
  });
}

// 모든 알림 읽음 처리
export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await api.patch('/notifications/read-all');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.setQueryData(["notifications", "unread"], 0);
    },
  });
}

// 모든 알림 삭제
export function useDeleteAllNotifications() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await api.delete('/notifications/delete-all');
    },
    onSuccess: () => {
      // 알림 목록 초기화
      queryClient.setQueryData<InfiniteData<NotificationPage>>(
        ["notifications"],
        (old) => ({
          ...old!,
          pages: old!.pages.map(page => ({
            ...page,
            notifications: []
          }))
        })
      );
      // 읽지 않은 알림 수 0으로 설정
      queryClient.setQueryData(["notifications", "unread"], 0);
    },
  });
}