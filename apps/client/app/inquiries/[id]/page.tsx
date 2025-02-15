"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/axios";
import { Inquiry, InquiryStatus } from "@/types/inquiry";
import { useToast } from "@/components/ui/toast";
import { IconArrowLeft, IconLoader2 } from "@tabler/icons-react";
import { formatDate, getImageUrl } from "@/lib/utils";
import { InquiryStatusBadge } from "@/components/inquiry/inquiry-status-badge";
import Image from "next/image";
import { motion } from "framer-motion";
import { Separator } from "@/components/ui/separator";
import { useIsAdmin } from "@/context/auth-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function InquiryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const [inquiry, setInquiry] = useState<Inquiry | null>(null);
  const [loading, setLoading] = useState(true);
  const [newAnswer, setNewAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const isAdmin = useIsAdmin();

  const fetchInquiry = useCallback(async () => {
    try {
      const response = await api.get<Inquiry>(`/inquiries/${params.id}`);
      setInquiry(response.data);
    } catch (error) {
      console.error("문의 조회 실패:", error);
      showToast("문의를 불러오는데 실패했습니다.", "error");
      router.push("/settings/about");
    } finally {
      setLoading(false);
    }
  }, [params.id, router, showToast]);

  useEffect(() => {
    fetchInquiry();
  }, [fetchInquiry]);

  const handleStatusUpdate = async (status: InquiryStatus) => {
    try {
      await api.patch(`/inquiries/${inquiry?.id}/status`, { status });
      showToast("상태가 업데이트되었습니다.", "success");
      fetchInquiry();
    } catch (error) {
      console.error("상태 업데이트 실패:", error);
      showToast("상태 업데이트에 실패했습니다.", "error");
    }
  };

  const handleAnswerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnswer.trim()) return;

    setSubmitting(true);
    try {
      await api.post(`/inquiries/${inquiry?.id}/answers`, { content: newAnswer });
      showToast("답변이 등록되었습니다.", "success");
      setNewAnswer("");
      fetchInquiry();
    } catch (error) {
      console.error("답변 등록 실패:", error);
      showToast("답변 등록에 실패했습니다.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <IconLoader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!inquiry) return null;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center text-white/60 hover:text-white/80 transition-colors"
        >
          <IconArrowLeft className="w-5 h-5" />
        </button>
        {isAdmin && (
          <Select
            value={inquiry.status}
            onValueChange={(value: InquiryStatus) => handleStatusUpdate(value)}
          >
            <SelectTrigger className="w-[140px] bg-white/5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border border-white/10">
              <SelectItem value="PENDING">대기중</SelectItem>
              <SelectItem value="IN_PROGRESS">처리중</SelectItem>
              <SelectItem value="RESOLVED">해결됨</SelectItem>
              <SelectItem value="CLOSED">닫힘</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {/* 문의 내용 */}
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold flex-1">{inquiry.title}</h1>
          <InquiryStatusBadge status={inquiry.status} />
        </div>
        
        <div className="flex items-center gap-2 text-sm text-white/40">
          <span>{inquiry.user?.name}</span>
          <span>•</span>
          <span>{formatDate(inquiry.createdAt)}</span>
        </div>

        <p className="text-white/80 whitespace-pre-wrap">{inquiry.content}</p>

        {/* 첨부 이미지 */}
        {inquiry.attachmentUrl && (
            <div className="relative max-w-xl mx-auto rounded-xl overflow-hidden 
                          border border-white/10 mt-4">
              <div className="relative aspect-[16/9]">
                <Image
                  src={getImageUrl(inquiry.attachmentUrl)}
                  alt="첨부 이미지"
                  fill
                  className="object-contain bg-black"
                />
              </div>
            </div>
        )}
      </div>

      <Separator />

      {/* 답변 목록 */}
      <div className="space-y-6">
        <h2 className="text-lg font-semibold">
          답변 {inquiry.answers?.length ?? 0}개
        </h2>
        <div className="space-y-4">
          {inquiry.answers?.map((answer) => (
            <div
              key={answer.id}
              className="p-4 rounded-xl bg-white/[0.02] border border-white/10"
            >
              <div className="flex items-center gap-2 text-sm text-white/40 mb-2">
                <span className="font-medium text-purple-400">
                  {answer.admin.name}
                </span>
                <span>•</span>
                <span>{formatDate(answer.createdAt)}</span>
              </div>
              <p className="text-white/80 whitespace-pre-wrap">
                {answer.content}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 답변 작성 폼 (관리자만) */}
      {isAdmin && (
        <form onSubmit={handleAnswerSubmit} className="space-y-4">
          <textarea
            value={newAnswer}
            onChange={(e) => setNewAnswer(e.target.value)}
            placeholder="답변을 입력하세요..."
            rows={4}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 
                     text-white placeholder:text-white/40 resize-none
                     focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={submitting || !newAnswer.trim()}
            className="w-full flex items-center justify-center gap-2 px-6 py-3
                     bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-500
                     hover:from-indigo-600 hover:via-purple-600 hover:to-violet-600
                     rounded-xl text-white font-medium transition-all
                     focus:outline-none focus:ring-2 focus:ring-purple-500/50
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "답변 등록 중..." : "답변 등록"}
          </motion.button>
        </form>
      )}
    </div>
  );
} 