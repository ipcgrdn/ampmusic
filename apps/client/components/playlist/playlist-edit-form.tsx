"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/toast";
import { updatePlaylist, uploadImage } from "@/lib/api/playlist";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ImageUpload } from "@/components/upload/image-upload";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Playlist } from "@/types/playlist";
import { getImageUrl } from "@/lib/utils";
import { EditUserTagInput } from "../tag/edit-user-tag-input";
import { User } from "@/types/auth";

interface PlaylistEditFormProps {
  playlist: Playlist;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ValidationErrors {
  title?: string;
  description?: string;
  coverImage?: string;
}

export function PlaylistEditForm({
  playlist,
  isOpen,
  onClose,
  onSuccess,
}: PlaylistEditFormProps) {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState(playlist.title);
  const [description, setDescription] = useState(playlist.description || "");
  const [isPublic, setIsPublic] = useState(playlist.isPublic);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [taggedUserIds, setTaggedUserIds] = useState<string[]>(
    playlist.taggedUsers?.map(tag => tag.user.id) || []
  );

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleImageChange = (file: File) => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
    setCoverImageFile(file);
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // 제목 검증
    if (!title.trim()) {
      newErrors.title = "제목을 입력해주세요";
    } else if (title.length > 100) {
      newErrors.title = "제목은 100자를 넘을 수 없습니다";
    }

    // 설명 검증
    if (description && description.length > 1000) {
      newErrors.description = "설명은 1000자를 넘을 수 없습니다";
    }

    // 이미지 검증
    if (coverImageFile) {
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (coverImageFile.size > maxSize) {
        newErrors.coverImage = "이미지 크기는 5MB를 넘을 수 없습니다";
      }
      
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(coverImageFile.type)) {
        newErrors.coverImage = "JPG, PNG, WEBP 형식만 지원합니다";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast("입력 내용을 확인해주세요", "error");
      return;
    }

    try {
      setIsLoading(true);

      let coverImageUrl = playlist.coverImage;
      if (coverImageFile) {
        const imageData = await uploadImage(coverImageFile);
        coverImageUrl = imageData.url;
      }

      await updatePlaylist(playlist.id, {
        title: title.trim(),
        description: description.trim(),
        coverImage: coverImageUrl,
        isPublic,
        taggedUserIds,
      });

      showToast("플레이리스트가 수정되었습니다.", "success");
      onSuccess();
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "플레이리스트 수정에 실패했습니다.",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-black/90 border border-white/10 backdrop-blur-xl overflow-hidden z-[1000]">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            플레이리스트 수정
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="overflow-y-auto pr-2" style={{ maxHeight: "calc(85vh - 120px)" }}>
          <div className="space-y-6 pb-4">
            <div className="space-y-4">
              <div className="text-sm text-white/60">커버 이미지</div>
              <div className="aspect-square w-full max-w-[200px] mx-auto">
                <ImageUpload
                  value={preview || (playlist.coverImage ? getImageUrl(playlist.coverImage) : "")}
                  onChange={handleImageChange}
                  disabled={isLoading}
                />
              </div>
              {errors.coverImage && (
                <p className="text-sm text-red-400/90">{errors.coverImage}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="text-sm text-white/60">제목</div>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="플레이리스트 제목"
                disabled={isLoading}
                className="bg-white/[0.03] border-white/[0.08] text-base text-white placeholder:text-white/40
                  focus:border-white/20 focus:ring-white/10 hover:border-white/20
                  transition-colors h-12 rounded-xl"
              />
              {errors.title && (
                <p className="text-sm text-red-400/90">{errors.title}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="text-sm text-white/60">설명</div>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="플레이리스트에 대한 설명을 입력해주세요"
                disabled={isLoading}
                className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/40
                  focus:border-white/20 focus:ring-white/10 hover:border-white/20
                  transition-colors min-h-[120px] rounded-xl resize-none"
              />
              {errors.description && (
                <p className="text-sm text-red-400/90">{errors.description}</p>
              )}
            </div>

            <div className="flex items-center justify-between p-4 bg-white/[0.03] rounded-xl border border-white/[0.08]">
              <div>
                <h3 className="text-white/90 font-medium">공개 설정</h3>
                <p className="text-white/60 text-sm">
                  {isPublic ? "모든 사용자가 볼 수 있습니다" : "나만 볼 수 있습니다"}
                </p>
              </div>
              <Switch
                checked={isPublic}
                onCheckedChange={setIsPublic}
                disabled={isLoading}
              />
            </div>

            {/* 태그 입력 섹션 */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white/90">태그할 사용자</h3>
                <p className="text-sm text-white/50">플레이리스트에 태그할 사용자를 선택해주세요</p>
              </div>

              <EditUserTagInput
                value={taggedUserIds}
                onChange={setTaggedUserIds}
                disabled={isLoading}
                initialTaggedUsers={playlist.taggedUsers?.map(tag => tag.user as User) || []}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10 mt-6 sticky bottom-0 bg-black/90 backdrop-blur-xl">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isLoading}
              className="text-white/60 hover:text-white hover:bg-white/[0.03]"
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !title.trim()}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-0"
            >
              {isLoading ? "수정 중..." : "수정하기"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
