import { Dialog, DialogTitle } from "@/components/ui/dialog";
import { DialogContent as UIDialogContent } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import {
  IconBook2,
  IconShieldLock,
  IconX,
} from "@tabler/icons-react";
import { memo } from "react";
import { PrivacyContent } from "./dialog-privacy";
import { TermsContent } from "./dialog-terms";

interface PolicyDialogProps {
  type: "terms" | "privacy" | null;
  onClose: () => void;
}

const POLICY_CONTENTS = {
  terms: {
    icon: <IconBook2 className="w-6 h-6 text-purple-400" />,
    title: "서비스 약관",
    subtitle: "AMP 서비스 이용약관",
  },
  privacy: {
    icon: <IconShieldLock className="w-6 h-6 text-purple-400" />,
    title: "개인정보 처리방침",
    subtitle: "개인정보 수집 및 이용",
  },
} as const;

// 메모이제이션된 헤더 컴포넌트
const DialogHeader = memo(function DialogHeader({
  type,
}: {
  type: "terms" | "privacy";
}) {
  const content = POLICY_CONTENTS[type];

  return (
    <div
      className="sticky top-0 z-10 bg-gradient-to-b from-zinc-900/95 to-zinc-900/80 
                  backdrop-blur-xl border-b border-white/10"
    >
      <div className="px-6 py-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 rounded-xl bg-purple-500/10">{content.icon}</div>
          <div>
            <h2 className="text-xl font-bold">{content.title}</h2>
            <p className="text-sm text-white/60">{content.subtitle}</p>
          </div>
        </div>
      </div>
    </div>
  );
});

// 메모이제이션된 콘텐츠 컴포넌트
const PolicyContent = memo(function PolicyContent({
  type,
}: {
  type: "terms" | "privacy";
}) {
  return (
    <div className="relative">
      <div
        className="absolute top-0 left-0 right-0 h-8 
                    bg-gradient-to-b from-zinc-900/50 to-transparent 
                    pointer-events-none z-10"
      />

      <div className="p-6 overflow-y-auto max-h-[calc(85vh-80px)]">
        <div className="prose prose-invert max-w-none">
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 mb-6">
            <p className="text-sm text-white/60">
              마지막 업데이트: 2025년 1월 1일
            </p>
          </div>

          {type === "terms" ? (
            <TermsContent />
          ) : (
            <PrivacyContent />
          )}
        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 h-8 
                    bg-gradient-to-t from-zinc-900/50 to-transparent 
                    pointer-events-none"
      />
    </div>
  );
});

// 메인 PolicyDialog 컴포넌트
export function PolicyDialog({ type, onClose }: PolicyDialogProps) {
  if (!type) return null;

  return (
    <Dialog open={!!type} onOpenChange={onClose}>
      <DialogTitle className="hidden">
        <DialogHeader type={type} />
      </DialogTitle>
      <UIDialogContent
        className="max-w-2xl p-0 bg-gradient-to-b from-zinc-900/95 to-black/95
                 border border-white/10"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative w-full overflow-hidden"
        >
          <DialogHeader type={type} />
          <PolicyContent type={type} />
        </motion.div>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 rounded-full 
                   bg-white/5 hover:bg-white/10 
                   text-white/60 hover:text-white/80 
                   transition-colors"
          aria-label="닫기"
        >
          <IconX className="w-5 h-5" />
        </button>
      </UIDialogContent>
    </Dialog>
  );
}