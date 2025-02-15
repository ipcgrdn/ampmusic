import { Separator } from "@/components/ui/separator";
import { IconHelp, IconClockHour4 } from "@tabler/icons-react";
import Link from "next/link";

export default function FAQPage() {
  return (
    <div className="space-y-8">
      {/* 헤더 섹션 */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 p-8">
        <div className="absolute inset-0 backdrop-blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-purple-500/10">
              <IconHelp className="w-6 h-6 text-purple-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">자주 묻는 질문</h1>
          </div>
          <p className="text-sm text-white/60">
            AMP 서비스 이용에 대한 궁금증을 해결해드립니다
          </p>
        </div>
      </div>

      <Separator />

      {/* 업데이트 예정 상태 */}
      <div className="flex flex-col items-center justify-center py-32 px-4">
        <div className="p-4 rounded-full bg-white/5 mb-4">
          <IconClockHour4 className="w-12 h-12 text-white/40" />
        </div>
        <h2 className="text-md font-medium text-white/80 mb-2">
          FAQ 페이지 업데이트 예정
        </h2>
        <p className="text-white/40 text-center max-w-md text-sm">
          더 나은 서비스 제공을 위해 FAQ 페이지를 준비 중입니다.
          <br />
          곧 유용한 정보로 찾아뵙도록 하겠습니다.
        </p>
        <div className="mt-8 p-4 rounded-xl bg-white/[0.02] border border-white/10">
          <p className="text-sm text-white/60">
            문의사항이 있으신가요?{" "}
            <Link
              href="/docs/support"
              className="text-purple-400 hover:text-purple-300 transition-colors"
            >
              고객센터
            </Link>
            로 연락주시면 신속히 답변드리도록 하겠습니다.
          </p>
        </div>
      </div>
    </div>
  );
} 