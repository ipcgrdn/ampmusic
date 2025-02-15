"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Track } from "@/types/album";
import { Album } from "@/types/album";
import { Playlist } from "@/types/playlist";
import { Comment } from "@/lib/api/comment";
import { IconAlertCircle } from "@tabler/icons-react";
import { useState } from "react";
import { api } from "@/lib/axios";
import { useToast } from "@/components/ui/toast";
import { motion } from "framer-motion";
import Link from "next/link";

type ReportType = "track" | "user" | "album" | "playlist" | "comment";

interface Profile {
  id: string;
  name: string;
  avatar: string;
}

interface ReportDialogProps {
  type: ReportType;
  data: Track | Profile | Album | Playlist | Comment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ReportInfo {
  title: string;
  content: string;
  displayInfo: {
    label: string;
    main: string;
    sub?: string;
  }
}
export function ReportDialog({ type, data, open, onOpenChange }: ReportDialogProps) {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  // 신고 대상에 따른 정보 구성
  const getReportInfo = () => {
    switch (type) {
      case "track": {
        const track = data as Track;
        return {
          title: `[트랙 신고] ${track.title} • ${track.album?.title} • ${track.artist?.name}`,
          content: `트랙: ${track.id}\n\n신고 사유:\n${reason}`,
          displayInfo: {
            label: "트랙 정보",
            main: track.title,
            sub: `${track.album?.title} • ${track.artist?.name}`,
          },
        };
      }
      case "user": {
        const user = data as Profile;
        return {
          title: `[사용자 신고] ${user.name}`,
          content: `사용자: ${user.id}\n\n신고 사유:\n${reason}`,
          displayInfo: {
            label: "사용자 정보",
            main: user.name,
          },
        };
      }
      case "album": {
        const album = data as Album;
        return {
          title: `[앨범 신고] ${album.title} • ${album.artist?.name}`,
          content: `앨범: ${album.id}\n\n신고 사유:\n${reason}`,
          displayInfo: {
            label: "앨범 정보",
            main: album.title,
            sub: `${album.artist?.name}`,
          },
        };
      }
      case "playlist": {
        const playlist = data as Playlist;
        return {
          title: `[플레이리스트 신고] ${playlist.title} • ${playlist.user?.name}`,
          content: `플레이리스트: ${playlist.id}\n\n신고 사유:\n${reason}`,
          displayInfo: {
            label: "플레이리스트 정보",
            main: playlist.title,
            sub: `${playlist.user?.name}`,
          },
        };
      }
      case "comment": {
        const comment = data as Comment;
        return {
          title: `[댓글 신고] ${comment.content}`,
          content: `댓글: ${comment.id}\n\n신고 사유:\n${reason}`,
          displayInfo: {
            label: "댓글 정보",
            main: comment.content,
            sub: comment.user?.name,
          },
        };
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    const reportInfo = getReportInfo();
    
    try {
      setIsSubmitting(true);
      await api.post("/inquiries", {
        type: "REPORT",
        title: reportInfo.title,
        content: reportInfo.content,
        attachmentUrl: "",
      });

      showToast("신고가 접수되었습니다.", "success");
      onOpenChange(false);
      setReason("");
    } catch (error) {
      console.error("신고 접수 실패:", error);
      showToast("신고 접수에 실패했습니다.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const reportInfo: ReportInfo = getReportInfo();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTitle className="hidden">콘텐츠 신고하기</DialogTitle>
      <DialogDescription className="hidden">
        부적절한 콘텐츠를 신고해주세요
      </DialogDescription>
      <DialogContent className="max-w-lg bg-zinc-900/95 border-white/10 p-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="p-6 space-y-6"
        >
          {/* 헤더 */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-500/10">
              <IconAlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">
                {type === "track" && "트랙 신고하기"}
                {type === "user" && "사용자 신고하기"}
                {type === "album" && "앨범 신고하기"}
                {type === "playlist" && "플레이리스트 신고하기"}
                {type === "comment" && "댓글 신고하기"}
              </h2>
              <p className="text-sm text-white/60">
                부적절한 콘텐츠를 신고해주세요
              </p>
            </div>
          </div>

          {/* 신고 대상 정보 */}
          <div className="p-4 rounded-xl bg-white/5 space-y-2">
            <div className="text-sm text-white/60">{reportInfo.displayInfo.label}</div>
            <div className="font-medium">{reportInfo.displayInfo.main}</div>
            <div className="text-sm text-white/60">{reportInfo.displayInfo.sub}</div>
          </div>

          {/* 신고 폼 */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-white/80">
                신고 사유를 자세히 설명해주세요
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="신고 사유를 입력해주세요..."
                rows={4}
                required
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 
                         text-white placeholder:text-white/40 resize-none text-sm
                         focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmitting || !reason.trim()}
              className="w-full flex items-center justify-center gap-2 px-6 py-3
                       bg-red-500 hover:bg-red-600 rounded-xl text-white font-medium 
                       transition-all focus:outline-none focus:ring-2 focus:ring-red-500/50
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "신고 접수 중..." : "신고하기"}
            </motion.button>
          </form>
          <div className="text-center text-xs text-white/60">
            더 상세한 문의가 필요하시다면{" "}
            <Link href="/docs/support" className="text-red-500 hover:text-red-400">
              고객센터
            </Link>
            {`에 문의해주세요.`}
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
