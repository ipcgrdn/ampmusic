import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

interface CustomInternalAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
  _retryCount?: number;
}

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// CSRF 토큰 설정
api.interceptors.request.use((config) => {
  const token = document.cookie
    .split('; ')
    .find(row => row.startsWith('XSRF-TOKEN'))
    ?.split('=')[1];

  if (token) {
    config.headers['X-XSRF-TOKEN'] = decodeURIComponent(token);
  }
  return config;
});

export let isRefreshing = false;

interface QueueItem {
  resolve: (value?: unknown) => void;
  reject: (reason?: Error) => void;
}

export let failedQueue: QueueItem[] = [];

export const resetQueue = () => {
  isRefreshing = false;
  failedQueue = [];
};

const processQueue = (error: Error | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

// 응답 인터셉터 수정
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomInternalAxiosRequestConfig;
    
    // 401 에러이고 재시도하지 않은 요청인 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      if ((originalRequest._retryCount || 0) >= 3) {
        window.dispatchEvent(new Event('unauthorized'));
        return Promise.reject(error);
      }
      
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;

      if (isRefreshing) {
        try {
          await new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          });
          return api(originalRequest);
        } catch (err) {
          return Promise.reject(err);
        }
      }

      isRefreshing = true;
      originalRequest._retry = true;

      try {
        const { data } = await api.post('/auth/refresh');
        
        // 응답 타입 체크 추가
        if (!data || typeof data.success !== 'boolean') {
          throw new Error('Invalid response format');
        }

        if (data.success) {
          processQueue();
          return api(originalRequest);
        }
        throw new Error('Token refresh failed');
      } catch (err) {
        processQueue(err as Error | null);
        if (err instanceof Error) {
          // 구체적인 에러 메시지 전달
          window.dispatchEvent(new CustomEvent('unauthorized', { 
            detail: { message: err.message } 
          }));
        } else {
          window.dispatchEvent(new Event('unauthorized'));
        }
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    // 다른 에러의 경우
    if (error.response?.status === 403) {
      // 권한 없음 에러 처리
      window.dispatchEvent(new Event('forbidden'));
    }

    return Promise.reject(error);
  }
);