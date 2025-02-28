"use client";

import { useAuth } from "@/context/auth-context";
import { IconUsers, IconPlaylist, IconDisc } from "@tabler/icons-react";
import Image from "next/image";
import { motion } from "framer-motion";

export default function AuthPage() {
  const { login } = useAuth();

  return (
    <div className="min-h-screen w-full flex bg-black">
      {/* 배경 효과 */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_0%_0%,#4f46e5_0,transparent_50%)]" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_100%_100%,#7c3aed_0,transparent_50%)]" />
        <div className="absolute inset-0 backdrop-blur-[100px]" />
      </div>

      {/* 컨텐츠 컨테이너 */}
      <div className="flex w-full max-w-7xl mx-auto">
        {/* 좌측 히어로 섹션 */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="hidden lg:flex flex-1 flex-col justify-center px-16 relative z-10"
        >
          <div className="max-w-xl">
            <h1 className="text-5xl font-bold mb-6 text-white leading-tight">
              Alternative
              <br />
              <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-500 bg-clip-text text-transparent">
                Music Platform
              </span>
            </h1>

            <p className="text-xl text-white/60 mb-12">
              새로운 방식으로 음악을 경험하세요
            </p>

            <div className="space-y-8">
              <Feature
                icon={<IconUsers className="w-5 h-5" />}
                title="아티스트 커뮤니티"
                description="창작자와 팬이 직접 소통하는 공간"
              />
              <Feature
                icon={<IconDisc className="w-5 h-5" />}
                title="간편한 업로드"
                description="쉽고 빠르게 음악을 업로드하세요"
              />
              <Feature
                icon={<IconPlaylist className="w-5 h-5" />}
                title="큐레이션"
                description="당신의 취향을 공유하고 발견하세요"
              />
            </div>
          </div>
        </motion.div>

        {/* 우측 로그인 섹션 */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="flex-1 flex items-center justify-center p-8 relative z-10"
        >
          <div
            className="w-full max-w-md p-12 rounded-3xl backdrop-blur-2xl 
                        bg-white/10 border border-white/20 shadow-2xl"
          >
            <div className="w-20 h-20 mx-auto">
              <Image
                src="/logo.png"
                alt="AMP Logo"
                width={64}
                height={64}
                className="object-contain"
              />
            </div>

            <div className="text-center space-y-4 mb-10">
              <h2 className="text-2xl font-semibold text-white">
                Welcome to AMP
              </h2>
              <p className="text-sm text-white/60">
                로그인하고 새로운 음악을 발견하세요
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={login}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 
                       bg-gradient-to-r from-indigo-900 via-purple-900 to-violet-900
                       hover:from-indigo-800 hover:via-purple-800 hover:to-violet-800
                       rounded-2xl text-white font-medium transition-all
                       shadow-lg shadow-purple-500/25"
            >
              <svg viewBox="0 0 48 48" className="w-5 h-5">
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                />
                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                />
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                />
              </svg>
              Continue with Google
            </motion.button>

            <p className="text-xs text-white/60 text-center mt-8">
              로그인 시 AMP의{" "}
              <a
                href="/auth/terms"
                className="text-purple-400 hover:text-purple-300 transition-colors"
              >
                서비스 약관
              </a>{" "}
              및{" "}
              <a
                href="/auth/privacy"
                className="text-purple-400 hover:text-purple-300 transition-colors"
              >
                개인정보 처리방침
              </a>
              에 동의하게 됩니다
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function Feature({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-sm">
        {icon}
      </div>
      <div>
        <h3 className="text-white font-medium mb-1">{title}</h3>
        <p className="text-white/60 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
