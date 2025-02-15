import { Separator } from "@/components/ui/separator";
import { IconLock, IconCookie, IconCopyright } from "@tabler/icons-react";
import Link from "next/link";

export default function PrivacySettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">개인정보</h2>
        <p className="text-sm text-white/60 mt-1">
          개인정보 보호 관련 정보를 확인합니다
        </p>
      </div>

      <Separator />

      <div className="space-y-4">
        {/* 개인정보 처리방침 */}
        <Link 
          href="/docs/privacy" 
          className="flex items-center gap-4 p-4 rounded-lg bg-white/[0.03] border border-white/10 
            hover:bg-white/[0.05] transition-colors group"
        >
          <div className="p-2 rounded-full bg-purple-500/10">
            <IconLock className="w-5 h-5 text-purple-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-white group-hover:text-purple-400 transition-colors">
              개인정보 처리방침
            </h3>
            <p className="text-sm text-white/60">
              개인정보 수집 및 이용에 대한 안내를 확인합니다
            </p>
          </div>
        </Link>

        {/* 보안 정책 */}
        <Link
          href="/docs/copyright"
          className="flex items-center gap-4 p-4 rounded-lg bg-white/[0.03] border border-white/10 
            hover:bg-white/[0.05] transition-colors group"
        >
          <div className="p-2 rounded-full bg-purple-500/10">
            <IconCopyright className="w-5 h-5 text-purple-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-white group-hover:text-purple-400 transition-colors">
              저작권 정책
            </h3>
            <p className="text-sm text-white/60">
              저작권 관련 정책을 확인합니다
            </p>
          </div>
        </Link>

        {/* 쿠키 정책 */}
        <Link
          href="/docs/cookie"
          className="flex items-center gap-4 p-4 rounded-lg bg-white/[0.03] border border-white/10 
            hover:bg-white/[0.05] transition-colors group"
        >
          <div className="p-2 rounded-full bg-purple-500/10">
            <IconCookie className="w-5 h-5 text-purple-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-white group-hover:text-purple-400 transition-colors">
              쿠키 정책
            </h3>
            <p className="text-sm text-white/60">
              쿠키 사용에 대한 정책을 확인합니다
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
} 