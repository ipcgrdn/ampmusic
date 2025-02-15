import { InquiryStatus } from "@/types/inquiry";

const STATUS_STYLES = {
  PENDING: "bg-yellow-500/10 text-yellow-500 ring-yellow-500/20",
  IN_PROGRESS: "bg-blue-500/10 text-blue-500 ring-blue-500/20",
  RESOLVED: "bg-green-500/10 text-green-500 ring-green-500/20",
  CLOSED: "bg-zinc-500/10 text-zinc-400 ring-zinc-500/20",
};

const STATUS_LABELS = {
  PENDING: "대기중",
  IN_PROGRESS: "처리중",
  RESOLVED: "해결됨",
  CLOSED: "닫힘",
};

export function InquiryStatusBadge({ status }: { status: InquiryStatus }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
} 