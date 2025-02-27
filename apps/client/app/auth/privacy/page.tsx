"use client";

import { motion } from "framer-motion";
import { IconArrowLeft } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { PrivacyContent } from "@/components/auth/dialog-privacy";

export default function PublicPrivacyPage() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen bg-black">
      {/* 배경 효과 - fixed로 변경하여 스크롤과 무관하게 항상 전체 화면 커버 */}
      <div className="fixed inset-0 w-full h-full overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_0%_0%,#4f46e5_0,transparent_50%)]" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_100%_100%,#7c3aed_0,transparent_50%)]" />
        <div className="absolute inset-0 backdrop-blur-[100px]" />
      </div>

      {/* 컨텐츠 - relative로 배경 위에 표시 */}
      <div className="relative z-10 max-w-4xl mx-auto p-6 md:p-8">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
          >
            <IconArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold">개인정보 처리방침</h1>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10"
        >
          <PrivacyContent />
        </motion.div>
      </div>
    </div>
  );
}