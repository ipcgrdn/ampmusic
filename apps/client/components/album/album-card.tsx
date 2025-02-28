import React from "react";
import { Album } from "@/types/album";
import Image from "next/image";
import Link from "next/link";
import { getImageUrl } from "@/lib/utils";
interface AlbumCardProps {
  album: Album;
}

export const AlbumCard: React.FC<AlbumCardProps> = ({ album }) => {
  return (
    <Link
      key={album.id}
      href={`/album/${album.id}`}
      className="group relative backdrop-blur-lg bg-white/5 rounded-xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300 hover:transform hover:scale-[1.02]"
    >
      <div className="aspect-square bg-gradient-to-br from-white/5 to-transparent relative">
        {album.coverImage && (
          <Image
            src={getImageUrl(album.coverImage)}
            alt={album.title}
            fill
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-[#533483]/20 via-transparent to-[#e6c200]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 via-black/50 to-transparent">
        <div className="text-sm font-medium text-white truncate">
          {album.title}
        </div>
        <div className="flex items-center gap-2 text-xs text-white/60 mt-1">
          <span>{album.artist?.name}</span>
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
        <div className="absolute bottom-0 left-0 right-0 p-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
          <button className="w-full py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-lg text-sm font-medium text-white transition-all duration-300 border border-white/20 hover:border-white/40">
            Play Now
          </button>
        </div>
      </div>
    </Link>
  );
};
