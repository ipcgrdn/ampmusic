import React from "react";
import { Track } from "@/types/album";
import Image from "next/image";
import { getImageUrl } from "@/lib/utils";
import { usePlayerStore } from "@/lib/store/player-store";
import { TrackActions } from "./track-actions";

interface TrackCardProps {
  track: Track;
}

export const TrackCard: React.FC<TrackCardProps> = ({ track }) => {
  const { play } = usePlayerStore();

  return (
    <div
      className="group relative flex items-center p-2 bg-white/10 backdrop-blur-lg rounded-lg border border-white/20 transition-transform duration-300 hover:scale-105"
      onClick={() => play(track)}
    >
      <div className="flex-shrink-0 w-10 h-10 relative">
        <Image
          src={getImageUrl(track.album?.coverImage || "")}
          width={64}
          height={64}
          alt={track.title}
          className="object-cover w-full h-full rounded-lg"
        />
      </div>
      <div className="ml-4 flex-grow">
        <h3 className="text-white font-semibold text-sm">{track.title}</h3>
        <div className="flex flex-row gap-1 items-center">
          <p className="text-gray-300 text-xs">{track.album?.title}</p>
          <span className="text-gray-300 text-xs">•</span>
          <p className="text-gray-300 text-xs">{track.artist.name}</p>
        </div>
      </div>
      <div className="flex-shrink-0">
        <TrackActions track={track} />
      </div>
    </div>
  );
};
