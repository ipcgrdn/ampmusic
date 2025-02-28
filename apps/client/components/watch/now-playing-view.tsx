"use client";

import { usePlayerStore } from "@/lib/store/player-store";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef } from "react";
import { IconCamera, IconMaximize, IconDownload } from "@tabler/icons-react";
import { useToast } from "@/components/ui/toast";
import html2canvas from "html2canvas";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getImageUrl } from "@/lib/utils";
export function NowPlayingView() {
  const { currentTrack } = usePlayerStore();
  const [showLyrics, setShowLyrics] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const viewRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  const captureView = async () => {
    if (!viewRef.current) return;

    try {
      // 현재 가사 보기가 열려있다면 닫기
      if (showLyrics) setShowLyrics(false);
      
      // UI 업데이트를 위한 짧은 대기
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const canvas = await html2canvas(viewRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
      });
      
      const image = canvas.toDataURL("image/png");
      setCapturedImage(image);
      setShowPreview(true);
    } catch (error) {
      console.error("Screenshot failed:", error);
      showToast("이미지 캡처에 실패했습니다", "error");
    }
  };

  const handleDownload = () => {
    if (!capturedImage || !currentTrack) return;
    
    const link = document.createElement("a");
    link.href = capturedImage;
    link.download = `AMP-${currentTrack.title}.png`;
    link.click();
    
    setShowPreview(false);
    setCapturedImage(null);
    showToast("이미지가 저장되었습니다", "success");
  };

  if (!currentTrack) return null;

  return (
    <>
      <AnimatePresence>
        <motion.div
          ref={viewRef}
          initial={{ opacity: 0, y: "100%" }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: "100%" }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
          }}
          className="flex flex-col h-full max-w-2xl mx-auto items-center justify-center"
        >
          {/* 앨범 아트워크 / 가사 토글 영역 */}
          <div
            className="relative group w-[400px] mx-auto cursor-pointer"
            onClick={() => setShowLyrics(!showLyrics)}
          >
            {/* 배경 블러 효과 */}
            <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 rounded-[32px] blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />

            <div className="relative aspect-square rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
              {/* 컨트롤 버튼 */}
              <div className="absolute top-4 right-4 flex gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();  // 가사 토글 방지
                    captureView();
                  }}
                  className="p-2 rounded-full bg-black/30 hover:bg-black/50 text-white/80 hover:text-white backdrop-blur-sm transition-all"
                  title="현재 화면 캡처"
                >
                  <IconCamera size={18} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();  // 가사 토글 방지
                    setShowFullscreen(true);
                  }}
                  className="p-2 rounded-full bg-black/30 hover:bg-black/50 text-white/80 hover:text-white backdrop-blur-sm transition-all"
                  title="앨범아트 전체화면"
                >
                  <IconMaximize size={18} />
                </button>
              </div>

              <AnimatePresence mode="wait">
                {!showLyrics ? (
                  // 앨범 커버
                  <motion.div
                    key="cover"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.1 }}
                    className="relative w-full h-full"
                  >
                    <Image
                      src={getImageUrl(currentTrack.album?.coverImage || "")}
                      alt={currentTrack.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/30" />

                    {/* 가사 보기 힌트 */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white/90 text-sm font-medium">
                        가사 보기
                      </span>
                    </div>
                  </motion.div>
                ) : (
                  // 가사 뷰
                  <motion.div
                    key="lyrics"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.1 }}
                    className="absolute inset-0 p-6 bg-black/90 backdrop-blur-sm overflow-y-auto"
                  >
                    {currentTrack.lyrics ? (
                      <div className="whitespace-pre-line text-white/80 leading-relaxed text-sm">
                        {currentTrack.lyrics}
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-white/40">
                        가사가 없습니다
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* 트랙 정보 */}
          <div className="mt-8 text-center space-y-3 px-4">
            <h1 className="text-3xl font-bold text-white tracking-tight">
              {currentTrack.title}
            </h1>
            <Link
              href={`/${currentTrack.artist?.id}`}
              className="inline-block text-lg text-white/60 hover:text-white transition-colors"
            >
              {currentTrack.artist?.name}
            </Link>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* 전체화면 모달 */}
      <Dialog open={showFullscreen} onOpenChange={setShowFullscreen}>
        <DialogHeader className="hidden">
          <DialogTitle>
            앨범아트 전체화면
          </DialogTitle>
        </DialogHeader>
        <DialogContent className="max-w-none w-screen h-[calc(100vh)] pb-20 border-none">
          <div className="relative w-full h-full flex items-center justify-center bg-black/90">
            <div className="relative h-full aspect-square">
              <Image
                src={getImageUrl(currentTrack.album?.coverImage || "")}
                alt={currentTrack.title}
                fill
                className="object-contain"
                priority={true}
                loading="eager"
                quality={100}
                sizes="100vw"
                unoptimized={true}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 캡처 미리보기 모달 */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="sm:max-w-[480px] p-0 gap-0 rounded-2xl border border-white/10 bg-black/80 backdrop-blur-xl shadow-2xl z-[100]">
          <div className="p-6 space-y-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-medium text-center text-white">
                캡처 미리보기
              </DialogTitle>
            </DialogHeader>

            {capturedImage && (
              <div className="relative rounded-xl overflow-hidden border border-white/10">
                <div className="absolute inset-0 bg-gradient-to-b from-black/5 to-black/20 pointer-events-none" />
                <Image
                  src={capturedImage}
                  alt="Captured preview"
                  width={480}
                  height={480}
                  className="object-cover"
                />
              </div>
            )}
          </div>

          {/* iOS 스타일 버튼 그룹 */}
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  setShowPreview(false);
                  setCapturedImage(null);
                }}
                className="flex-1 px-6 py-3 text-sm font-medium transition-colors rounded-xl hover:bg-white/5"
              >
                취소
              </button>
              <div className="w-px h-8 bg-white/10" />
              <button
                onClick={handleDownload}
                className="flex-1 px-6 py-3 text-sm font-medium rounded-xl hover:bg-white/5 inline-flex items-center justify-center gap-2"
              >
                <IconDownload size={16} />
                저장하기
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
