"use client";

import { Separator } from "@/components/ui/separator";
import { IconHeadset, IconMail, IconSend } from "@tabler/icons-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { api } from "@/lib/axios";
import { InquiryType } from "@/types/inquiry";
import { useToast } from "@/components/ui/toast";
import { ImageUpload } from "@/components/upload/image-upload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";

// 문의 유형 옵션
const INQUIRY_TYPES: { value: InquiryType; label: string }[] = [
  { value: "ACCOUNT", label: "계정 관련" },
  { value: "CONTENT", label: "콘텐츠 관련" },
  { value: "COPYRIGHT", label: "저작권 문제" },
  { value: "TECHNICAL", label: "기술적 문제" },
  { value: "REPORT", label: "신고하기" },
  { value: "SUGGESTION", label: "제안하기" },
  { value: "OTHER", label: "기타 문의" },
];

export default function SupportPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    type: "",
    title: "",
    content: "",
    attachmentUrl: "",
  });
  const [attachment, setAttachment] = useState<File | null>(null);

  // 유저 정보로 폼 초기화
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name,
      }));
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      showToast("로그인이 필요합니다.", "error");
      return;
    }

    try {
      setIsSubmitting(true);

      // 이미지 업로드 처리
      const uploadedImageUrl = attachment
        ? (
            await api.post(
              "/inquiries/upload/image",
              (() => {
                const formData = new FormData();
                formData.append("file", attachment);
                return formData;
              })(),
              {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              }
            )
          ).data.url
        : null;

      // API 호출
      await api.post("/inquiries", {
        type: formData.type as InquiryType,
        title: formData.title,
        content: formData.content,
        attachmentUrl: uploadedImageUrl,
      });

      showToast("문의가 등록되었습니다.", "success");
      router.push("/settings/about");

      // 폼 초기화
      setFormData({
        type: "",
        title: "",
        content: "",
        attachmentUrl: "",
      });
      setAttachment(null);
    } catch (error) {
      console.error("문의 등록 실패:", error);
      showToast("문의 등록에 실패했습니다.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      {/* 헤더 섹션 */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 p-8">
        <div className="absolute inset-0 backdrop-blur-3xl" />
        <div className="relative flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-500/10">
            <IconHeadset className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">문의하기</h1>
            <p className="text-sm text-white/60">
              궁금하신 점이나 건의사항을 남겨주세요
            </p>
          </div>
        </div>
      </div>

      <Separator />

      {/* 문의 폼 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 문의 유형 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80">
              문의 유형
            </label>
            <Select
              value={formData.type}
              onValueChange={(value: InquiryType) =>
                setFormData({ ...formData, type: value })
              }
            >
              <SelectTrigger className="w-full bg-white/5">
                <SelectValue placeholder="문의 유형을 선택해주세요" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border border-white/10">
                {INQUIRY_TYPES.map((type) => (
                  <SelectItem
                    key={type.value}
                    value={type.value}
                    className="text-white/80 focus:bg-white/10 focus:text-white"
                  >
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 제목 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80">제목</label>
            <input
              required
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="문의 제목을 입력해주세요"
              className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 
                       text-white placeholder:text-white/40 placeholder:text-sm  
                       focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </div>

          {/* 내용 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80">내용</label>
            <textarea
              required
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              placeholder="문의하실 내용을 자세히 적어주세요"
              rows={6}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 
                       text-white placeholder:text-white/40 resize-none placeholder:text-sm
                       focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </div>

          {/* 첨부 파일 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80">
              첨부 파일
            </label>
            <ImageUpload
              value={attachment ? URL.createObjectURL(attachment) : ""}
              onChange={(file: File) => setAttachment(file)}
              className="w-full aspect-[3/1]"
            />
            <p className="text-xs text-white/40">
              이미지 파일만 업로드 가능합니다 (최대 5MB)
            </p>
          </div>

          {/* 제출 버튼 */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 px-6 py-3
                     bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-500
                     hover:from-indigo-600 hover:via-purple-600 hover:to-violet-600
                     rounded-xl text-white font-medium transition-all
                     focus:outline-none focus:ring-2 focus:ring-purple-500/50
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <IconSend className="w-4 h-4" />
            {isSubmitting ? "처리 중..." : "문의하기"}
          </motion.button>
        </form>
      </motion.div>

      {/* 안내 메시지 */}
      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
        <div className="flex items-start gap-3">
          <IconMail className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-white/60">
            문의하신 내용은 최대한 빠르게 답변드리도록 하겠습니다.
          </p>
        </div>
      </div>
    </div>
  );
}
