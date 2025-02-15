"use client";

import { useState } from "react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { IconAlertCircle, IconDotsVertical, IconEdit, IconTrash } from "@tabler/icons-react";
import { deleteAlbum } from "@/lib/api/album";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { ReportDialog } from "../track/report-dialog";
import { Album } from "@/types/album";

interface AlbumActionsProps {
  isOwner: boolean;
  album: Album;
  onEdit: () => void;
}

export function AlbumActions({ isOwner, album, onEdit }: AlbumActionsProps) {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { showToast } = useToast();
  const [isReportOpen, setIsReportOpen] = useState(false);

  const handleDelete = async () => {
    if (!isOwner) {
      showToast("앨범 삭제 권한이 없습니다", "error");
      return;
    }

    try {
      setIsDeleting(true);
      await deleteAlbum(album.id);
      showToast("앨범이 삭제되었습니다", "success");
      router.push("/");
      router.refresh();
    } catch (error) {
      showToast(error instanceof Error ? error.message : "앨범 삭제에 실패했습니다", "error");
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <IconDotsVertical className="w-5 h-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-40 bg-black/90 border border-white/10 backdrop-blur-xl"
        >
          {!isOwner && (
            <DropdownMenuItem 
              onClick={() => setIsReportOpen(true)}
              className="text-white/80 hover:text-white focus:text-white focus:bg-white/10"
            >
              <IconAlertCircle className="h-4 w-4" />
              <span>신고하기</span>
            </DropdownMenuItem>
          )}
          {isOwner && (
            <DropdownMenuItem 
              onClick={onEdit}
              className="text-white/80 hover:text-white focus:text-white focus:bg-white/10"
            >
            <IconEdit className="w-4 h-4 mr-2" />
              수정
            </DropdownMenuItem>
          )}
          {isOwner && (
            <DropdownMenuItem 
              onClick={() => setIsDeleteDialogOpen(true)}
              className="text-red-400 hover:text-red-300 focus:text-red-300 focus:bg-red-500/10"
          >
            <IconTrash className="w-4 h-4 mr-2" />
              삭제
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-black/90 border border-white/10 backdrop-blur-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">앨범을 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              이 작업은 되돌릴 수 없으며, 앨범의 모든 트랙이 함께 삭제됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              disabled={isDeleting}
              className="bg-white/5 hover:bg-white/10 text-white border-white/10"
            >
              취소
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-500/80 hover:bg-red-500 text-white border-red-500/50"
            >
              {isDeleting ? "삭제 중..." : "삭제"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ReportDialog
        type="album"
        data={album}
        open={isReportOpen}
        onOpenChange={setIsReportOpen}
      />
    </>
  );
} 