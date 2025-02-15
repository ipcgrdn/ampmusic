import { useQuery } from '@tanstack/react-query';
import { getRecommendedTracksFromQueue } from '@/lib/api/track';
import { usePlayerStore } from '@/lib/store/player-store';

export function useTrackRecommendations() {
  const queue = usePlayerStore(state => state.queue);
  const currentTrack = usePlayerStore(state => state.currentTrack);
  const setRecommendedTracks = usePlayerStore(state => state.setRecommendedTracks);

  return useQuery({
    queryKey: ['trackRecommendations', queue.map(track => track.id), currentTrack?.id],
    queryFn: async () => {
      if (queue.length === 0) return [];
      
      // 1. 현재 큐의 모든 트랙 ID (현재 트랙 포함) 수집
      const existingTrackIds = new Set([
        ...queue.map(track => track.id),
        ...(currentTrack ? [currentTrack.id] : [])
      ]);

      const recommendations = await getRecommendedTracksFromQueue(queue.map(track => track.id));
      
      // 2. 강화된 필터링 로직
      const filteredRecommendations = recommendations.filter(rec => {
        // 현재 큐나 현재 트랙과 중복되지 않는지 확인
        const isDuplicate = existingTrackIds.has(rec.id);
        // 이미 추천된 트랙이 아닌지 확인 (recommendationId로)
        const isAlreadyRecommended = queue.some(
          track => (track as any).recommendationId?.includes(rec.id)
        );
        
        return !isDuplicate && !isAlreadyRecommended;
      });

      const recommendationsWithUniqueIds = filteredRecommendations.map(track => ({
        ...track,
        recommendationId: `recommendation-${track.id}-${Date.now()}`  // 타임스탬프 추가로 완벽한 유니크 ID 보장
      }));

      // 3. 빈 배열 체크 추가
      if (recommendationsWithUniqueIds.length === 0) {
        return [];
      }

      setRecommendedTracks(recommendationsWithUniqueIds);
      return recommendationsWithUniqueIds;
    },
    enabled: queue.length > 0,
    staleTime: 0,  // 캐시를 사용하지 않고 항상 새로운 데이터 fetch
    gcTime: 1000 * 60,  // 1분
    refetchOnMount: true,  // 컴포넌트 마운트시 항상 새로운 데이터 fetch
    refetchOnWindowFocus: true,  // 윈도우 포커스시 새로운 데이터 fetch
  });
} 