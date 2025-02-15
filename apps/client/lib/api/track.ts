import { api } from "@/lib/axios";
import { Track } from "@/types/album";

export async function recordTrackPlay(trackId: string): Promise<void> {
  try {
    await api.post(`/tracks/${trackId}/plays`);
  } catch (error) {
    // 재생 기록 실패는 사용자 경험에 영향을 주지 않도록 조용히 처리
    console.error("Failed to record track play:", error);
  }
}

export interface TrackRecommendation {
  id: string;
  title: string;
  duration: number;
  lyrics: string;
  description: string;
  credit: string;
  audioUrl: string;
  plays: number;
  album: {
    id: string;
    title: string;
    coverImage: string;
    artist: {
      id: string;
      name: string;
    };
  };
  recommendReason: {
    type: "ARTIST" | "FOLLOW" | "SIMILAR" | "POPULAR";
    description: string;
  };
}

export const getRecommendations = async (): Promise<TrackRecommendation[]> => {
  const { data } = await api.get<TrackRecommendation[]>(
    "/tracks/recommendations"
  );
  return data;
};

export interface SimilarUsersTrack {
  id: string;
  title: string;
  duration: number;
  lyrics: string;
  description: string;
  credit: string;
  audioUrl: string;
  plays: number;
  likedByCount: number;
  album: {
    id: string;
    title: string;
    coverImage: string;
    artist: {
      id: string;
      name: string;
    };
  };
}

export const getSimilarUsersTracks = async (): Promise<SimilarUsersTrack[]> => {
  const { data } = await api.get<SimilarUsersTrack[]>(
    "/tracks/similar-users-tracks"
  );
  return data;
};

export const getTrackById = async (id: string): Promise<Track> => {
  const { data } = await api.get<Track>(`/tracks/${id}`);
  return data;
};

export const getRecommendedTracksFromQueue = async (trackIds: string[]) => {
  const { data } = await api.post<Track[]>(
    "/tracks/recommendations/from-queue",
    {
      trackIds,
    }
  );
  return data;
};
