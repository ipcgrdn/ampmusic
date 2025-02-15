import React from "react";
import { User } from "@/types/auth";
import Image from "next/image";
import Link from "next/link";

interface ArtistCardProps {
  artist: User;
}

export const ArtistCard: React.FC<ArtistCardProps> = ({ artist }) => {
  return (
    <Link
      key={artist.id}
      href={`/${artist.id}`}
      className="group relative backdrop-blur-lg bg-white/5 rounded-full overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300 hover:transform hover:scale-[1.02]"
    >
      <div className="aspect-square relative overflow-hidden rounded-full">
        {artist.avatar && (
          <Image
            src={artist.avatar}
            alt={artist.name}
            fill
            className="object-cover rounded-full"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 via-black/50 to-transparent text-center">
        <div className="text-base font-medium text-white truncate">
          {artist.name}
        </div>
      </div>
    </Link>
  );
};
