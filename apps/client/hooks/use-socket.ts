import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/context/auth-context';
import { useNotificationStore } from '@/store/notification-store';
import { useToast } from '@/components/ui/toast';

export function useSocket() {
  const { user } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const { addNotification, incrementUnreadCount } = useNotificationStore();
  const { showToast } = useToast();

  useEffect(() => {
    if (!user) return;

    // Socket.io 클라이언트 초기화
    socketRef.current = io(`${process.env.NEXT_PUBLIC_API_URL}/notifications`, {
      withCredentials: true, // 쿠키 전송을 위한 설정
      transports: ['websocket', 'polling'],
    });

    // 연결 이벤트 리스너
    socketRef.current.on('connect', () => {
      console.log('Connected to notification server');
    });

    // 연결 에러 리스너
    socketRef.current.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    // 알림 수신 이벤트 리스너
    socketRef.current.on('notification', (notification) => {
      // 알림 상태 업데이트
      addNotification(notification);
      incrementUnreadCount();
      
      // 토스트 메시지 표시
      showToast(notification.content, 'info');
    });

    // Clean up
    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [user, addNotification, incrementUnreadCount, showToast]);

  return socketRef.current;
} 