import { Dialog } from "@/components/ui/dialog";
import { Inquiry, InquiryStatus } from "@/types/inquiry";
import { InquiryStatusBadge } from "./inquiry-status-badge";
import { formatDate, getImageUrl } from "@/lib/utils";
import { useState } from "react";
import { IconSend, IconPaperclip } from "@tabler/icons-react";
import Image from "next/image";

interface InquiryDetailDialogProps {
  inquiry: Inquiry;
  onClose: () => void;
  onStatusUpdate: (inquiryId: string, status: InquiryStatus) => Promise<void>;
  onAnswerSubmit: (inquiryId: string, content: string) => Promise<void>;
}

export function InquiryDetailDialog({
  inquiry,
  onClose,
  onStatusUpdate,
  onAnswerSubmit,
}: InquiryDetailDialogProps) {
  const [newAnswer, setNewAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);

  const handleStatusChange = async (status: InquiryStatus) => {
    await onStatusUpdate(inquiry.id, status);
  };

  const handleAnswerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnswer.trim()) return;

    setSubmitting(true);
    try {
      await onAnswerSubmit(inquiry.id, newAnswer);
      setNewAnswer("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-zinc-900 shadow-xl">
          {/* 헤더 */}
          <div className="sticky top-0 z-20 bg-zinc-900/95 backdrop-blur-sm border-b border-white/10 p-4">
            <div className="flex items-center gap-3 mb-2">
              <InquiryStatusBadge status={inquiry.status} />
              <select
                value={inquiry.status}
                onChange={(e) => handleStatusChange(e.target.value as InquiryStatus)}
                className="text-sm bg-transparent border border-white/10 rounded-lg px-2 py-1"
              >
                <option value="PENDING">대기중</option>
                <option value="IN_PROGRESS">처리중</option>
                <option value="RESOLVED">해결됨</option>
                <option value="CLOSED">닫힘</option>
              </select>
            </div>
            <h2 className="text-xl font-bold">{inquiry.title}</h2>
          </div>

          {/* 본문 */}
          <div className="p-4 space-y-6">
            {/* 문의 내용 */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-white/40">
                <span>{inquiry.user?.name}</span>
                <span>•</span>
                <span>{formatDate(inquiry.createdAt)}</span>
              </div>
              <p className="text-white/80 whitespace-pre-wrap">{inquiry.content}</p>

              {/* 첨부 이미지 */}
              {inquiry.attachmentUrl && (
                <div className="mt-4">
                  <div className="flex items-center gap-2 mb-2 text-sm text-white/60">
                    <IconPaperclip className="w-4 h-4" />
                    <span>첨부 이미지</span>
                  </div>
                  <div 
                    className="relative cursor-pointer group"
                    onClick={() => setImageModalOpen(true)}
                  >
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden">
                      <Image
                        src={getImageUrl(inquiry.attachmentUrl)}
                        alt="첨부 이미지"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 
                                transition-opacity flex items-center justify-center">
                      <span className="text-sm text-white">크게 보기</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 답변 목록 */}
            {inquiry.answers && inquiry.answers.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">답변</h3>
                {inquiry.answers.map((answer) => (
                  <div
                    key={answer.id}
                    className="p-4 rounded-xl bg-white/[0.02] border border-white/10"
                  >
                    <div className="flex items-center gap-2 text-sm text-white/40 mb-2">
                      <span>{answer.admin.name}</span>
                      <span>•</span>
                      <span>{formatDate(answer.createdAt)}</span>
                    </div>
                    <p className="text-white/80 whitespace-pre-wrap">
                      {answer.content}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* 답변 작성 폼 */}
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
              <button
                type="submit"
                disabled={submitting || !newAnswer.trim()}
                className="flex items-center justify-center gap-2 px-4 py-2 
                         bg-purple-500 hover:bg-purple-600 rounded-lg
                         disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <IconSend className="w-4 h-4" />
                {submitting ? "답변 등록 중..." : "답변 등록"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* 이미지 모달 */}
      {imageModalOpen && inquiry.attachmentUrl && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90"
          onClick={() => setImageModalOpen(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <Image
              src={getImageUrl(inquiry.attachmentUrl)}
              alt="첨부 이미지"
              width={1200}
              height={800}
              className="object-contain"
            />
          </div>
        </div>
      )}
    </Dialog>
  );
} 