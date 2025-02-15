"use client";

import { useEffect, useState, useCallback } from "react";
import { useToast } from "@/components/ui/toast";
import { api } from "@/lib/axios";
import { Inquiry } from "@/types/inquiry";
import { IconInbox, IconLoader2, IconPaperclip } from "@tabler/icons-react";
import { Separator } from "@/components/ui/separator";
import { InquiryStatusBadge } from "@/components/inquiry/inquiry-status-badge";
import { formatDate } from "@/lib/utils";
import { useIsAdmin } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";

export default function AdminInquiriesPage() {
  const { user } = useAuth();
  const isAdmin = useIsAdmin();
  const { showToast } = useToast();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  useEffect(() => {
    if (!isAdmin) {
      showToast("관리자만 접근할 수 있습니다.", "error");
      router.push("/");
    }
  }, [isAdmin, showToast, router]);

  const fetchInquiries = useCallback(async () => {
    try {
      const response = await api.get<Inquiry[]>("/inquiries");
      setInquiries(response.data);
    } catch (error) {
      console.error("문의 목록 조회 실패:", error);
      showToast("문의 목록을 불러오는데 실패했습니다.", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (user && isAdmin) {
      fetchInquiries();
    }
  }, [user, isAdmin, fetchInquiries]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <IconLoader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">문의 관리</h1>
          <p className="text-sm text-white/60 mt-2">
            총 {inquiries.length}개의 문의가 있습니다
          </p>
        </div>
      </div>

      <Separator />

      {/* 문의 목록 */}
      {inquiries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32">
          <IconInbox className="w-12 h-12 text-white/20" />
          <p className="mt-4 text-white/40">등록된 문의가 없습니다</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {inquiries.map((inquiry) => (
            <div
              key={inquiry.id}
              onClick={() => router.push(`/inquiries/${inquiry.id}`)}
              className="p-4 rounded-xl bg-white/[0.02] border border-white/10 
                       hover:bg-white/[0.04] transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <InquiryStatusBadge status={inquiry.status} />
                    <span className="text-sm text-white/40">
                      {formatDate(inquiry.createdAt)}
                    </span>
                    {inquiry.attachmentUrl && (
                      <div className="flex items-center gap-1 text-white/40">
                        <IconPaperclip className="w-4 h-4" />
                        <span className="text-xs">첨부 이미지</span>
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg font-medium mb-1 truncate">
                    {inquiry.title}
                  </h3>
                  <p className="text-sm text-white/60 line-clamp-2">
                    {inquiry.content}
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-sm text-white/40">
                    <span>{inquiry.user?.name}</span>
                    <span>•</span>
                    <span>{inquiry.user?.email}</span>
                  </div>
                </div>
                <div className="text-sm text-white/40">
                  {inquiry.answers?.length ?? 0}개의 답변
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 