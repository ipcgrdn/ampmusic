import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 날짜 포맷팅 (예: "2024년 3월 15일")
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "오늘";
  } else if (diffDays === 1) {
    return "어제";
  } else if (diffDays < 7) {
    return `${diffDays}일 전`;
  } else {
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
}

// 시간 포맷팅 (예: "3:45")
export function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// 긴 시간 포맷팅 (예: "1시간 23분")
export function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// 긴 시간 포맷팅 (예: "1시간 23분")
export function formatDurationLong(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}시간 ${minutes}분`;
  }
  return `${minutes}분`;
}

export function getImageUrl(path: string): string {
  console.log('getImageUrl input path:', path);
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
  
  if (!path) {
    console.log('Path is empty or undefined');
    return '';
  }
  
  // path가 이미 완전한 URL인 경우 그대로 반환
  if (path.startsWith('http')) {
    console.log('Returning original URL:', path);
    return path;
  }
  
  // 프로덕션 환경에서는 CDN URL 사용
  if (process.env.NODE_ENV === 'production') {
    const cdnUrl = `https://cdn.ampmusic.im${path}`;
    console.log('Returning CDN URL:', cdnUrl);
    return cdnUrl;
  }
  
  // 개발 환경에서는 API 서버 URL 사용
  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}${path}`;
  console.log('Returning API URL:', apiUrl);
  return apiUrl;
}

export function formatCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}
