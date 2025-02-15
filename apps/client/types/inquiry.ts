export type InquiryType = 
  | "ACCOUNT"    // 계정 관련
  | "CONTENT"    // 콘텐츠 관련
  | "COPYRIGHT"  // 저작권 문제
  | "TECHNICAL"  // 기술적 문제
  | "REPORT"     // 신고하기
  | "SUGGESTION" // 제안하기
  | "OTHER";     // 기타 문의

export type InquiryStatus = 
  | "PENDING"     // 대기중
  | "IN_PROGRESS" // 처리중
  | "RESOLVED"    // 해결됨
  | "CLOSED";     // 닫힘

export interface Inquiry {
  id: string;
  type: InquiryType;
  title: string;
  content: string;
  attachmentUrl?: string;
  status: InquiryStatus;
  createdAt: string;
  updatedAt: string;
  userId: string;
  adminNote?: string;
  answers?: InquiryAnswer[];
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface InquiryAnswer {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  inquiryId: string;
  adminId: string;
  admin: {
    id: string;
    name: string;
  };
} 