"use client";

import { useAuth } from "@/context/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { IconLogout, IconTrash } from "@tabler/icons-react";
import { useToast } from "@/components/ui/toast";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { api } from "@/lib/axios";

export default function AccountSettingsPage() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      showToast("로그아웃되었습니다.", "success");
      window.location.href = "/auth";
    } catch (error) {
      console.error("Logout failed:", error);
      showToast("로그아웃에 실패했습니다.", "error");
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    try {
      setIsDeleting(true);
      await api.delete(`/users/${user.id}`);
      showToast("계정이 삭제되었습니다.", "success");
      window.location.href = "/auth";
      await logout(); // 계정 삭제 후 로그아웃
    } catch {
      showToast("계정 삭제에 실패했습니다.", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* 계정 정보 섹션 */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-white">계정 정보</h2>
          <p className="text-sm text-white/60 mt-1">
            기본적인 계정 정보를 확인합니다
          </p>
        </div>

        <div className="flex items-center gap-4 p-4 rounded-lg bg-white/[0.03] border border-white/10">
          <Avatar className="w-12 h-12 ring-2 ring-white/10">
            <AvatarImage src={user?.avatar || ""} />
            <AvatarFallback className="bg-white/[0.03]">
              {user?.name?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-medium text-white">{user?.name}</h3>
            <p className="text-sm text-white/60 truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      <Separator className="bg-white/[0.08] my-8" />

      {/* 계정 관리 섹션 */}
      <div className="space-y-4 flex items-end justify-between">
        <Button
          variant="ghost"
          className="text-red-400/60 hover:text-red-400 w-full justify-start text-sm"
          onClick={handleLogout}
        >
          <IconLogout className="w-4 h-4 mr-2" />
          로그아웃
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              className="text-red-400/60 hover:text-red-400 w-full justify-start text-sm"
            >
              <IconTrash className="w-4 h-4 mr-2" />
              계정 삭제
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-black/90 border-white/10">
            <AlertDialogHeader>
              <AlertDialogTitle>정말 계정을 삭제하시겠습니까?</AlertDialogTitle>
              <AlertDialogDescription className="text-white/60">
                계정을 삭제하면 모든 데이터가 영구적으로 삭제되며, 이 작업은
                되돌릴 수 없습니다.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-white/5 hover:bg-white/10 border-white/10">
                취소
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border-0"
              >
                {isDeleting ? "삭제 중..." : "계정 삭제"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
