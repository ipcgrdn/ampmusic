import { Separator } from "@/components/ui/separator";
import { IconBellRinging, IconMoodEmpty } from "@tabler/icons-react";

export default function NoticesPage() {
  return (
    <div className="space-y-8">
      {/* 헤더 섹션 */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 p-8">
        <div className="absolute inset-0 backdrop-blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-purple-500/10">
              <IconBellRinging className="w-6 h-6 text-purple-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">공지사항</h1>
          </div>
          <p className="text-sm text-white/60">
            AMP의 새로운 소식과 업데이트 내용을 확인하세요
          </p>
        </div>
      </div>

      <Separator />

      {/* 공지사항 없음 상태 */}
      <div className="flex flex-col items-center justify-center py-32 px-4">
        <div className="p-4 rounded-full bg-white/5 mb-4">
          <IconMoodEmpty className="w-12 h-12 text-white/40" />
        </div>
        <h2 className="text-md font-medium text-white/80 mb-2">
          등록된 공지사항이 없습니다
        </h2>
        <p className="text-white/40 text-center max-w-md text-sm">
          새로운 공지사항이 등록되면 이 곳에서 확인하실 수 있습니다.
          <br />
          앞으로 AMP의 새로운 소식을 전해드리도록 하겠습니다.
        </p>
      </div>
    </div>
  );
} 