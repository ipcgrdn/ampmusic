"use client";

import { useRouter } from "next/navigation";
import { Disc, ListMusic, Plus } from "lucide-react";

const uploadOptions = [
  {
    title: "앨범",
    description: "여러 트랙을 포함한 앨범을 업로드합니다",
    icon: Disc,
    href: "/upload/album",
    color: "from-purple-500/10 to-blue-500/10"
  },
  {
    title: "플레이리스트",
    description: "나만의 플레이리스트를 만들어보세요",
    icon: ListMusic,
    href: "/upload/playlist",
    color: "from-indigo-500/10 to-purple-500/10"
  },
  {
    title: "준비 중",
    description: "Coming Soon...",
    icon: Plus,
    href: "",
    color: "from-blue-500/10 to-indigo-500/10"
  },
];

export default function UploadPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen relative">
      {/* Background Effects - z-index 수정 */}
      <div className="fixed inset-0 z-[-1]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]" />
      </div>

      {/* Content - z-index 추가 */}
      <div className="relative z-[1] container max-w-4xl mx-auto py-12">
        <div className="space-y-6 px-4">
          {/* Header */}
          <div className="space-y-2 text-center mb-12">
            <h1 className="text-3xl font-bold tracking-tight text-white/90">
              무엇을 공유하시겠어요?
            </h1>
            <p className="text-white/70">
              당신의 음악을 세상과 나눌 방법을 선택해주세요
            </p>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {uploadOptions.map((option) => (
              <button
                key={option.title}
                onClick={() => router.push(option.href)}
                className="group relative p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05]
                  backdrop-blur-sm transition-all hover:bg-white/[0.04] text-left"
              >
                {/* Hover Effect */}
                <div className={`absolute -inset-2 bg-gradient-to-r ${option.color} rounded-3xl
                  opacity-0 group-hover:opacity-100 transition-opacity blur-xl`} />
                
                <div className="relative space-y-4">
                  <div className="h-12 w-12 rounded-full bg-white/[0.05] flex items-center justify-center
                    group-hover:scale-110 transition-transform">
                    <option.icon className="h-6 w-6 text-white/70" />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-white/90 mb-1">
                      {option.title}
                    </h3>
                    <p className="text-sm text-white/50">
                      {option.description}
                    </p>
                  </div>

                  <div className="absolute bottom-20 right-4 opacity-0 transform translate-x-2
                    group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                    <span className="text-white/60">→</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 