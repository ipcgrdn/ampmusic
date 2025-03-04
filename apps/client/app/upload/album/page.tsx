"use client";

import { PageTransition } from "@/components/ui/page-transition";
import { AlbumUploadForm } from "@/components/upload/album-upload-form";
import Link from "next/link";
export default function AlbumUploadPage() {
  return (
    <PageTransition>
      <div className="min-h-screen relative">
        {/* Background Effects - pointer-events-none 추가 */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]" />
        </div>

        {/* Content - z-index 조정 */}
        <div className="relative z-10 container max-w-4xl mx-auto py-12">
          <div className="space-y-6 px-4">
            {/* Header */}
            <div className="space-y-2 text-center mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white/90">
                새로운 앨범 업로드
              </h1>
              <p className="text-white/70 text-sm sm:text-base">
                당신의 음악을 세상과 공유하세요
              </p>
            </div>

            <div className="flex items-center justify-center">
              <p className="text-sm text-white font-bold">
                AMP는 저작권 정책을 준수합니다.
                <br />
                <Link
                  href="/docs/copyright"
                  className="text-purple-400 hover:text-purple-300"
                >
                  저작권 정책
                </Link>{" "}
                을 반드시 확인해주세요
              </p>
            </div>

            {/* Upload Form Container - 투명도 조정 */}
            <div
              className="backdrop-blur-md bg-white/[0.03] border border-white/[0.08] rounded-xl 
            shadow-xl p-6 md:p-8 relative overflow-hidden"
            >
              {/* Decorative Elements - 더 부드럽게 */}
              <div className="absolute inset-0 pointer-events-none">
                <div
                  className="absolute -top-1/2 -right-1/2 w-96 h-96 bg-purple-500/5 
                rounded-full blur-3xl"
                />
                <div
                  className="absolute -bottom-1/2 -left-1/2 w-96 h-96 bg-indigo-500/5 
                rounded-full blur-3xl"
                />
              </div>

              {/* Form */}
              <div className="relative">
                <AlbumUploadForm />
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
