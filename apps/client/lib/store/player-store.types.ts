import { Track as AlbumTrack } from "@/types/album";

// 플레이어에서 사용하는 트랙 타입
export interface Track extends AlbumTrack {
  order: number;  // 재생 목록에서의 순서
}

// 반복 모드 타입
export type RepeatMode = 'off' | 'all' | 'one';

// 플레이어 상태 타입
export interface PlayerState {
  // 현재 재생 상태
  isPlaying: boolean;
  currentTrack: Track | null;
  
  // 재생 목록 관련
  queue: Track[];
  originalQueue: Track[] | null;  // 셔플 전 원본 큐
  isShuffled: boolean;
  
  // 오디오 설정
  volume: number;
  isMuted: boolean;
  repeatMode: RepeatMode;
  
  // 메서드들
  play: (track: Track, tracks?: Track[]) => void;
  pause: () => void;
  toggle: () => void;
  next: () => void;
  previous: () => void;
  seek: (time: number) => void;
  
  // 재생 목록 관리
  addToQueue: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  reorderQueue: (oldIndex: number, newIndex: number) => void;
  
  // 설정 관리
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  setRepeatMode: (mode: RepeatMode) => void;
}

export interface RecommendedTrack extends Track {
  recommendationId: string;
}