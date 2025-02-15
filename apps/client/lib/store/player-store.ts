import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { recordTrackPlay } from "@/lib/api/track";
import { getRecommendedTracksFromQueue } from "../api/track";

interface Track {
  id: string;
  title: string;
  audioUrl: string;
  albumId: string;
  lyrics: string;
  duration: number;
  plays: number;
  album?: {
    id: string;
    title: string;
    coverImage?: string;
  };
  artist?: {
    id: string;
    name: string;
  };
}

type PlayMode = 'normal' | 'repeat-all' | 'repeat-one' | 'shuffle';

interface WebKit {
  webkitAudioContext: typeof window.AudioContext;
}

interface PlayerStore {
  currentTrack: Track | null;
  isPlaying: boolean;
  queue: Track[];
  volume: number;
  isMuted: boolean;
  showQueue: boolean;
  playMode: PlayMode;
  repeatMode: 'off' | 'all' | 'one';
  isShuffled: boolean;
  originalQueue: Track[];
  lastPlayRecorded: string | null;
  
  // Actions
  play: (track: Track, tracks?: Track[]) => void;
  pause: () => void;
  toggle: () => void;
  playNext: () => void;
  playPrevious: () => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;

  addToQueue: (track: Track) => void;
  addNextToQueue: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  toggleQueue: () => void;
  reorderQueue: (startIndex: number, endIndex: number) => void;
  
  togglePlayMode: () => void;
  toggleRepeatMode: () => void;
  toggleShuffle: () => void;
  handleTrackEnd: () => void;
  handleTimeUpdate: (currentTime: number, duration: number) => void;

  // 추천 트랙 관련 상태 수정
  recommendedTracks: (Track & { recommendationId: string })[];
  isLoadingRecommendations: boolean;

  // 추천 트랙 관련 메서드 추가
  fetchRecommendations: () => Promise<void>;
  addRecommendedToQueue: () => void;

  // 큐 업데이트 시 자동으로 추천 트랙 가져오기
  updateQueue: (newQueue: Track[]) => void;

  // 추천 트랙에서 특정 트랙 제거
  removeFromRecommendations: (index: number) => void;

  // 추천 트랙 순서 변경
  reorderRecommendations: (startIndex: number, endIndex: number) => void;

  // 추천 트랙 설정 메서드 추가
  setRecommendedTracks: (tracks: (Track & { recommendationId: string })[]) => void;
}

export const usePlayerStore = create<PlayerStore>()(
  persist(
    (set, get) => ({
      currentTrack: null,
      isPlaying: false,
      queue: [],
      volume: 1,
      isMuted: false,
      showQueue: false,
      playMode: 'normal',
      repeatMode: 'off' as const,
      isShuffled: false,
      originalQueue: [],
      lastPlayRecorded: null,
      recommendedTracks: [],
      isLoadingRecommendations: false,

      play: (track, tracks) => {
        if (typeof window !== 'undefined') {
          const AudioContext = window.AudioContext || ((window as unknown as WebKit).webkitAudioContext);
          const audioContext = new AudioContext();
          audioContext.resume();
        }

        set(() => {
          if (tracks) {
            get().fetchRecommendations();
            return {
              currentTrack: track,
              queue: tracks,
              isPlaying: true,
              lastPlayRecorded: null
            };
          }
          
          get().fetchRecommendations();
          return {
            currentTrack: track,
            queue: [track],
            isPlaying: true,
            lastPlayRecorded: null
          };
        });

        // 재생 시작 시 기록
        recordTrackPlay(track.id);
        set({ lastPlayRecorded: track.id });
      },
      pause: () => set({ isPlaying: false }),
      toggle: () => set((state) => ({ isPlaying: !state.isPlaying })),
      
      setVolume: (volume) => set({ volume, isMuted: volume === 0 }),
      toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
      
      addToQueue: (track) => set(state => {
        const { queue } = state;
        
        // 이미 큐에 존재하는 트랙인지 확인
        const existingIndex = queue.findIndex(t => t.id === track.id);
        
        if (existingIndex !== -1) {
          // 기존 트랙을 제거하고 마지막에 추가
          const newQueue = queue.filter(t => t.id !== track.id);
          return {
            queue: [...newQueue, track]
          };
        }

        // 새로운 트랙 추가
        return {
          queue: [...queue, track]
        };
      }),
      
      addNextToQueue: (track) => set(state => {
        const { currentTrack, queue } = state;
        
        // 이미 큐에 존재하는 트랙인지 확인
        const existingIndex = queue.findIndex(t => t.id === track.id);
        
        if (!currentTrack) {
          return {
            currentTrack: track,
            queue: [track],
            isPlaying: true
          };
        }

        const currentIndex = queue.findIndex(t => t.id === currentTrack.id);
        
        // 현재 트랙이 큐에 없는 경우
        if (currentIndex === -1) {
          // 기존에 있던 트랙이면 제거
          const newQueue = existingIndex !== -1 
            ? queue.filter(t => t.id !== track.id)
            : queue;
          
          return {
            queue: [track, ...newQueue]
          };
        }

        // 기존 트랙이 있으면 제거하고 현재 트랙 다음에 추가
        const remainingTracks = [...queue];
        if (existingIndex !== -1) {
          // 기존 트랙이 현재 트랙 이전에 있었다면 인덱스 조정 필요
          const adjustedCurrentIndex = existingIndex < currentIndex 
            ? currentIndex - 1 
            : currentIndex;
          
          remainingTracks.splice(adjustedCurrentIndex + 1, 0, track);
        } else {
          remainingTracks.splice(currentIndex + 1, 0, track);
        }

        return {
          queue: remainingTracks
        };
      }),
      
      removeFromQueue: (index) => set(state => ({
        queue: state.queue.filter((_, i) => i !== index)
      })),
      
      playNext: () => {
        const { currentTrack, queue, isShuffled, repeatMode, recommendedTracks } = get();
        if (!currentTrack || queue.length === 0) return;

        const currentIndex = queue.findIndex(track => track.id === currentTrack.id);

        // 마지막 트랙인 경우
        if (currentIndex === queue.length - 1) {
          if (repeatMode === 'all') {
            // 전체 반복: 첫 번째 트랙으로
            set({ 
              currentTrack: queue[0], 
              isPlaying: true 
            });
          } else {
            // 일반 모드이고 추천 트랙이 있는 경우
            if (recommendedTracks.length > 0) {
              // 추천 트랙들을 큐에 추가하고 첫 번째 추천 트랙부터 재생
              set(state => ({ 
                queue: [...state.queue, ...recommendedTracks],
                currentTrack: recommendedTracks[0],
                recommendedTracks: [], // 추천 트랙 목록 초기화
                isPlaying: true
              }));
            } else {
              // 추천 트랙이 없는 경우 기존처럼 처리
              set({ 
                currentTrack: queue[0],
                isPlaying: false
              });
            }
          }
          return;
        }

        // 다음 트랙 선택
        let nextTrack;
        if (isShuffled) {
          // 셔플 모드: 남은 트랙 중에서 랜덤 선택
          const remainingTracks = queue.filter((_, i) => i !== currentIndex);
          nextTrack = remainingTracks[Math.floor(Math.random() * remainingTracks.length)];
        } else {
          // 일반 모드: 다음 트랙
          nextTrack = queue[currentIndex + 1];
        }

        if (nextTrack) {
          set({ 
            currentTrack: nextTrack, 
            isPlaying: true 
          });
        }
      },
      
      playPrevious: () => {
        const { currentTrack, queue } = get();
        if (!currentTrack || queue.length === 0) return;
        
        const currentIndex = queue.findIndex(track => track.id === currentTrack.id);
        const previousTrack = queue[currentIndex - 1];
        if (previousTrack) {
          set({ currentTrack: previousTrack, isPlaying: true });
        }
      },
      
      clearQueue: () => set({ queue: [], currentTrack: null, isPlaying: false }),
      
      toggleQueue: () => set(state => ({ showQueue: !state.showQueue })),
      
      reorderQueue: (startIndex: number, endIndex: number) => set(state => {
        const newQueue = Array.from(state.queue);
        const [removed] = newQueue.splice(startIndex, 1);
        newQueue.splice(endIndex, 0, removed);
        return { queue: newQueue };
      }),
      
      togglePlayMode: () => set(state => {
        const modes: PlayMode[] = ['normal', 'repeat-all', 'repeat-one', 'shuffle'];
        const currentIndex = modes.indexOf(state.playMode);
        const nextMode = modes[(currentIndex + 1) % modes.length];
        return { playMode: nextMode };
      }),
      
      toggleRepeatMode: () => set(state => {
        const modes = ['off', 'all', 'one'] as const;
        const currentIndex = modes.indexOf(state.repeatMode);
        const nextMode = modes[(currentIndex + 1) % modes.length];
        return { repeatMode: nextMode };
      }),
      
      toggleShuffle: () => {
        const state = get();
        const { queue, currentTrack, originalQueue } = state;

        if (!queue.length) return;

        if (state.isShuffled) {
          // 셔플 해제: 원래 순서로 복원
          set({ 
            queue: originalQueue,
            isShuffled: false 
          });
        } else {
          // 셔플 실행
          // 1. 현재 순서를 저장
          const newOriginalQueue = [...queue];
          
          // 2. 현재 재생 중인 트랙을 제외한 나머지 트랙들만 섞기
          const currentTrackIndex = queue.findIndex(
            track => track.id === currentTrack?.id
          );
          
          const remainingTracks = [...queue];
          if (currentTrackIndex !== -1) {
            // 현재 트랙을 제거
            remainingTracks.splice(currentTrackIndex, 1);
          }

          // Fisher-Yates 셔플 알고리즘으로 나머지 트랙들을 섞기
          for (let i = remainingTracks.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [remainingTracks[i], remainingTracks[j]] = 
            [remainingTracks[j], remainingTracks[i]];
          }

          // 3. 현재 트랙을 맨 앞에 추가하고 나머지는 셔플된 순서로
          const newShuffledQueue = currentTrack 
            ? [currentTrack, ...remainingTracks]
            : remainingTracks;

          set({
            queue: newShuffledQueue,
            originalQueue: newOriginalQueue,
            isShuffled: true
          });
        }
      },
      
      handleTrackEnd: () => {
        const { currentTrack, queue, repeatMode, isShuffled, recommendedTracks } = get();
        if (!currentTrack || queue.length === 0) return;

        const currentIndex = queue.findIndex(track => track.id === currentTrack.id);

        // 한 곡 반복 모드
        if (repeatMode === 'one') {
          set({ isPlaying: true });
          return;
        }

        // 마지막 트랙인 경우
        if (currentIndex === queue.length - 1) {
          if (repeatMode === 'all') {
            // 전체 반복: 첫 번째 트랙으로
            set({ 
              currentTrack: queue[0], 
              isPlaying: true 
            });
          } else {
            // 일반 모드이고 추천 트랙이 있는 경우
            if (recommendedTracks.length > 0) {
              // 추천 트랙들을 큐에 추가하고 첫 번째 추천 트랙부터 재생
              set(state => ({ 
                queue: [...state.queue, ...recommendedTracks],
                currentTrack: recommendedTracks[0],
                recommendedTracks: [], // 추천 트랙 목록 초기화
                isPlaying: true
              }));
            } else {
              // 추천 트랙이 없는 경우 기존처럼 처리
              set({ 
                isPlaying: false,
                currentTrack: queue[0]
              });
            }
          }
          return;
        }

        // 다음 트랙 선택
        let nextTrack;
        if (isShuffled) {
          // 셔플 모드: 남은 트랙 중에서 랜덤 선택
          const remainingTracks = queue.filter((_, i) => i !== currentIndex);
          nextTrack = remainingTracks[Math.floor(Math.random() * remainingTracks.length)];
        } else {
          // 일반 모드: 다음 트랙
          nextTrack = queue[currentIndex + 1];
        }

        if (nextTrack) {
          set({ 
            currentTrack: nextTrack, 
            isPlaying: true 
          });
        }

        set({ lastPlayRecorded: null });  // 트랙 종료 시 초기화
      },

      // 트랙 재생 진행도 모니터링을 위한 함수 추가
      handleTimeUpdate: (currentTime: number, duration: number) => {
        const { currentTrack, lastPlayRecorded } = get();
        
        if (!currentTrack) return;
        if (currentTrack.id === lastPlayRecorded) return;

        const thirtySecondsPlayed = currentTime >= 30;
        const thirtyPercentPlayed = duration > 0 && (currentTime / duration) >= 0.3;

        if (thirtySecondsPlayed || thirtyPercentPlayed) {
          recordTrackPlay(currentTrack.id)
            .then(() => {
              set({ lastPlayRecorded: currentTrack.id });
            })
            .catch((error) => {
              console.error('Failed to record track play:', error);
              // 실패 시 lastPlayRecorded를 업데이트하지 않아 재시도 가능
            });
        }
      },

      // 현재 큐 기반으로 추천 트랙 가져오기
      fetchRecommendations: async () => {
        const { queue } = get();
        if (queue.length === 0) return;

        // 이미 요청 중인 경우 중복 요청 방지
        if (get().isLoadingRecommendations) return;

        set({ isLoadingRecommendations: true });
        try {
          const trackIds = queue.map(track => track.id);
          const recommendations = await getRecommendedTracksFromQueue(trackIds);
          set({ recommendedTracks: recommendations.map(track => ({
            ...track,
            recommendationId: `recommendation-${track.id}`
          })) });
        } catch (error) {
          console.error('Failed to fetch recommendations:', error);
        } finally {
          set({ isLoadingRecommendations: false });
        }
      },

      // 추천 트랙을 큐에 추가
      addRecommendedToQueue: () => {
        const { recommendedTracks, queue } = get();
        set({ 
          queue: [...queue, ...recommendedTracks],
          recommendedTracks: [] // 추가 후 초기화
        });
      },

      // 큐 업데이트 시 자동으로 추천 트랙 가져오기
      updateQueue: (newQueue: Track[]) => {
        set({ queue: newQueue });
      },

      // 추천 트랙에서 특정 트랙 제거
      removeFromRecommendations: (index: number) => set(state => ({
        recommendedTracks: state.recommendedTracks.filter((_, i) => i !== index)
      })),

      // 추천 트랙 순서 변경
      reorderRecommendations: (startIndex: number, endIndex: number) => set(state => {
        const newRecommendedTracks = Array.from(state.recommendedTracks);
        const [removed] = newRecommendedTracks.splice(startIndex, 1);
        newRecommendedTracks.splice(endIndex, 0, removed);
        return { recommendedTracks: newRecommendedTracks };
      }),

      // 추천 트랙 설정 메서드 추가
      setRecommendedTracks: (tracks) => set({ recommendedTracks: tracks }),
    }),
    {
      name: 'player-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentTrack: state.currentTrack,
        queue: state.queue,
        volume: state.volume,
        isMuted: state.isMuted,
        repeatMode: state.repeatMode,
        isShuffled: state.isShuffled,
        originalQueue: state.originalQueue,
      }),
    }
  )
);