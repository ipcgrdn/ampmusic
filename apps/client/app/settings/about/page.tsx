"use client";

import { useIsAdmin } from "@/context/auth-context";
import { IconInbox } from "@tabler/icons-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { 
  IconBuildingStore, 
  IconFileText, 
  IconShieldCheck,
  IconBellRinging,
  IconMessages,
  IconQuestionMark,
} from "@tabler/icons-react";
import Link from "next/link";

const sections = [
  {
    title: "공지사항",
    description: "서비스 업데이트 및 새로운 소식을 확인하세요",
    href: "/docs/notices",
    icon: IconBellRinging,
  },
  {
    title: "서비스 소개",
    description: "Alternative Music Platform (AMP)에 대해 알아보세요",
    href: "/docs/about",
    icon: IconBuildingStore,
  },
  {
    title: "이용약관",
    description: "서비스 이용에 대한 약관을 확인합니다",
    href: "/docs/terms",
    icon: IconFileText,
  },
  {
    title: "청소년보호정책",
    description: "청소년 보호를 위한 정책을 확인합니다",
    href: "/docs/youth",
    icon: IconShieldCheck,
  },
  {
    title: "고객센터",
    description: "문의사항이 있으시다면 언제든 연락주세요",
    href: "/docs/support",
    icon: IconMessages,
    badge: "24/7",
  },
  {
    title: "자주 묻는 질문",
    description: "서비스 이용에 대한 일반적인 질문들을 확인하세요",
    href: "/docs/faq",
    icon: IconQuestionMark,
  },
];

export default function AboutPage() {
  const router = useRouter();

  const isAdmin = useIsAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">AMP 소개</h2>
        <p className="text-sm text-white/60 mt-1">
          서비스 정보 및 고객 지원
        </p>
      </div>

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map((section) => (
          <Link
            key={section.title}
            href={section.href}
            className="flex flex-col p-4 rounded-lg bg-white/[0.03] border border-white/10 
              hover:bg-white/[0.05] transition-colors group relative overflow-hidden"
          >
            {/* 배경 그라데이션 효과 */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 
              opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative flex items-center gap-4">
              <div className="p-2 rounded-full bg-purple-500/10">
                <section.icon className="w-5 h-5 text-purple-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs sm:text-sm font-medium text-white group-hover:text-purple-400 
                    transition-colors">
                    {section.title}
                  </h3>
                  {section.badge && (
                    <span className="px-2 py-0.5 text-xs font-medium text-purple-400 
                      bg-purple-500/10 rounded-full">
                      {section.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-white/60 mt-0.5">
                  {section.description}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* 문의 관리 섹션 */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">문의 관리</h2>
        <div className="grid gap-4">
          {/* 내 문의 내역 */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => router.push('/inquiries/me')}
            className="flex items-center justify-between p-4 rounded-xl 
                     bg-white/[0.02] border border-white/10 
                     hover:bg-white/[0.04] transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10 
                           group-hover:bg-purple-500/20 transition-colors">
                <IconInbox className="w-5 h-5 text-purple-400" />
              </div>
              <div className="text-left">
                <div className="font-medium text-xs sm:text-sm">내 문의 내역</div>
                <div className="text-xs sm:text-sm text-white/40">
                  문의 내역을 확인하고 관리하세요
                </div>
              </div>
            </div>
          </motion.button>

          {/* 관리자용 전체 문의 관리 버튼 */}
          {isAdmin && (
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => router.push('/inquiries/admin')}
              className="flex items-center justify-between p-4 rounded-xl 
                       bg-gradient-to-br from-purple-500/10 to-blue-500/10 
                       border border-white/10 hover:from-purple-500/20 
                       hover:to-blue-500/20 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/10 
                             group-hover:bg-white/20 transition-colors">
                  <IconInbox className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-xs sm:text-sm">전체 문의 관리</div>
                  <div className="text-xs sm:text-sm text-white/40">
                    관리자용 문의 관리 페이지로 이동
                  </div>
                </div>
              </div>
            </motion.button>
          )}
        </div>
      </section>
    </div>
  );
} 