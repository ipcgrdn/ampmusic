"use client";

import { useState } from "react";
import { Album, CreateAlbumDto } from "@/types/album";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  IconMusic,
  IconUpload,
  IconX,
  IconGripVertical,
  IconCheck,
  IconChevronDown,
  IconChevronRight,
} from "@tabler/icons-react";
import { updateAlbum, uploadImage, uploadAudio } from "@/lib/api/album";
import { useToast } from "@/components/ui/toast";
import Image from "next/image";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn, formatDuration } from "@/lib/utils";
import { EditUserTagInput } from "../tag/edit-user-tag-input";
import { User } from "@/types/auth";
import { getImageUrl } from "@/lib/utils";
interface AlbumEditFormProps {
  album: Album;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface Track {
  id?: string;
  title: string;
  duration: number;
  audioUrl: string;
  order: number;
  description?: string;
  lyrics?: string;
  credit?: string;
}

interface SortableTrackItemProps {
  track: Track;
  index: number;
  onTrackChange: (track: Track) => void;
  onRemoveTrack: () => void;
  onAudioUpload: (file: File, index: number) => Promise<void>;
}

function SortableTrackItem({
  track,
  index,
  onTrackChange,
  onRemoveTrack,
  onAudioUpload,
}: SortableTrackItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: track.id || `new-${index}` });

  const [isExpanded, setIsExpanded] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex flex-col gap-4",
        "rounded-xl p-4 border transition-colors",
        isDragging
          ? "bg-white/[0.08] border-purple-500/30"
          : "bg-white/[0.02] hover:bg-white/[0.04] border-white/5"
      )}
      {...attributes}
    >
      <div className="flex items-center gap-3 w-full">
        <div
          {...listeners}
          className={cn(
            "cursor-move transition-colors duration-200 rounded p-1 hover:bg-white/5",
            isDragging
              ? "text-purple-400"
              : "text-white/20 group-hover:text-white/40"
          )}
        >
          <IconGripVertical className="w-5 h-5" />
        </div>

        <div className="w-8 text-center font-medium text-white/40">
          {index + 1}
        </div>

        <Input
          value={track.title}
          onChange={(e) => onTrackChange({ ...track, title: e.target.value })}
          className="bg-transparent border-none text-white flex-1 focus:ring-0 px-0"
          placeholder="트랙 제목"
          required
        />

        <div className="flex items-center gap-2">
          {track.audioUrl ? (
            <div
              className="flex items-center gap-2 text-sm"
              onClick={() =>
                onTrackChange({ ...track, duration: 0, audioUrl: "" })
              }
            >
              <span className="text-white/40">
                {formatDuration(track.duration)}
              </span>
              <IconCheck className="w-4 h-4 text-green-500" />
            </div>
          ) : (
            <Input
              type="file"
              accept="audio/*"
              onChange={(e) =>
                e.target.files?.[0] && onAudioUpload(e.target.files[0], index)
              }
              className="bg-transparent border-white/10 text-white w-full sm:w-48 
            focus:ring-0 focus:border-white/20 text-sm"
              required
            />
          )}

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onRemoveTrack()}
            className="text-white/40 hover:text-white"
          >
            <IconX className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 상세 정보 토글 버튼 */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-sm text-white/60 hover:text-white/80 transition-colors"
      >
        {isExpanded ? (
          <IconChevronDown className="w-4 h-4" />
        ) : (
          <IconChevronRight className="w-4 h-4" />
        )}
        트랙 정보
      </button>

      {/* 추가 정보 입력 영역 */}
      {isExpanded && (
        <div className="space-y-4 border-t border-white/5 pt-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-white/60">
              트랙 소개
            </label>
            <Textarea
              value={track.description || ""}
              onChange={(e) =>
                onTrackChange({ ...track, description: e.target.value })
              }
              placeholder="트랙에 대한 설명을 입력하세요 (선택사항)"
              className="bg-transparent border-white/10 resize-none h-20 text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-white/60">가사</label>
            <Textarea
              value={track.lyrics || ""}
              onChange={(e) =>
                onTrackChange({ ...track, lyrics: e.target.value })
              }
              placeholder="가사를 입력하세요 (선택사항)"
              className="bg-transparent border-white/10 resize-none h-32 text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-white/60">크레딧</label>
            <Input
              value={track.credit || ""}
              onChange={(e) =>
                onTrackChange({ ...track, credit: e.target.value })
              }
              placeholder="작곡가, 작사가 등의 정보를 입력하세요 (선택사항)"
              className="bg-transparent border-white/10 text-sm"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export function AlbumEditForm({
  album,
  isOpen,
  onClose,
  onSuccess,
}: AlbumEditFormProps) {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<{
    title: string;
    description?: string;
    releaseDate: string;
    coverImage?: string;
    tracks: Track[];
    taggedUserIds: string[];
  }>({
    title: album.title,
    description: album.description,
    releaseDate: album.releaseDate.split("T")[0],
    coverImage: album.coverImage,
    tracks: [...album.tracks]
      .sort((a, b) => a.order - b.order)
      .map((track) => ({
        id: track.id,
        title: track.title,
        duration: track.duration,
        audioUrl: track.audioUrl,
        order: track.order,
        description: track.description,
        lyrics: track.lyrics,
        credit: track.credit,
      })),
    taggedUserIds: album.taggedUsers?.map((tag) => tag.user.id) || [],
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    console.log('Drag End Debug:', {
      activeId: active.id,
      overId: over.id,
      currentTracks: formData.tracks.map(t => ({
        id: t.id,
        title: t.title,
        order: t.order
      }))
    });

    const oldIndex =
      formData.tracks?.findIndex(
        (track) => (track.id || `new-${track.order}`) === active.id
      ) ?? -1;
    const newIndex =
      formData.tracks?.findIndex(
        (track) => (track.id || `new-${track.order}`) === over.id
      ) ?? -1;

    console.log('Track Indices:', { oldIndex, newIndex });

    if (oldIndex !== -1 && newIndex !== -1 && formData.tracks) {
      const updatedTracks = arrayMove(formData.tracks, oldIndex, newIndex).map(
        (track, index) => ({
          ...track,
          order: index + 1,
        })
      );

      console.log('Updated Tracks:', updatedTracks.map(t => ({
        id: t.id,
        title: t.title,
        order: t.order
      })));

      setFormData((prev) => ({ ...prev, tracks: updatedTracks }));
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      const result = await uploadImage(file);
      setFormData((prev) => ({ ...prev, coverImage: result.url }));
      showToast("이미지가 업로드되었습니다", "success");
    } catch {
      showToast("이미지 업로드에 실패했습니다", "error");
    }
  };

  const handleAudioUpload = async (file: File, index: number) => {
    try {
      const result = await uploadAudio(file);
      setFormData((prev) => ({
        ...prev,
        tracks: prev.tracks?.map((track, i) =>
          i === index
            ? { ...track, audioUrl: result.url, duration: result.duration }
            : track
        ),
      }));
      showToast("오디오가 업로드되었습니다", "success");
    } catch {
      showToast("오디오 업로드에 실패했습니다", "error");
    }
  };

  // 폼 유효성 검사 함수 추가
  const validateForm = (
    data: Partial<CreateAlbumDto>
  ): { isValid: boolean; message: string } => {
    if (!data.title?.trim()) {
      return { isValid: false, message: "앨범 제목을 입력해주세요" };
    }
    
    if (!data.coverImage) {
      return { isValid: false, message: "앨범 커버 이미지를 업로드해주세요" };
    }

    if (!data.tracks?.length) {
      return { isValid: false, message: "최소 1개 이상의 트랙을 추가해주세요" };
    }

    // 각 트랙의 유효성 검사
    const invalidTrack = data.tracks.find(
      (track) => !track.title?.trim() || !track.audioUrl
    );
    if (invalidTrack) {
      return {
        isValid: false,
        message: "모든 트랙에 제목과 오디오 파일이 필요합니다",
      };
    }

    return { isValid: true, message: "" };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 폼 유효성 검사
    const validation = validateForm(formData);
    if (!validation.isValid) {
      showToast(validation.message, "error");
      return;
    }

    try {
      setIsLoading(true);

      // 트랙 순서 재정렬
      const reorderedTracks = formData.tracks.map((track, index) => ({
        ...track,
        order: index + 1,
      }));

      console.log('Submit Debug - Before API Call:', {
        albumId: album.id,
        originalTracks: formData.tracks.map(t => ({
          id: t.id,
          title: t.title,
          order: t.order
        })),
        reorderedTracks: reorderedTracks.map(t => ({
          id: t.id,
          title: t.title,
          order: t.order
        }))
      });

      // releaseDate를 ISO 형식으로 변환
      const formattedData = {
        ...formData,
        tracks: reorderedTracks,
        releaseDate: new Date(
          formData.releaseDate + "T00:00:00.000Z"
        ).toISOString(),
      };

      const response = await updateAlbum(album.id, {
        ...formattedData,
        taggedUserIds: formData.taggedUserIds,
      });

      console.log('Submit Debug - API Response:', {
        success: true,
        updatedAlbum: {
          id: response.id,
          tracks: response.tracks?.map(t => ({
            id: t.id,
            title: t.title,
            order: t.order
          }))
        }
      });

      showToast("앨범이 수정되었습니다", "success");
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Submit Debug - Error:', {
        error,
        requestData: {
          albumId: album.id,
          tracks: formData.tracks.map(t => ({
            id: t.id,
            title: t.title,
            order: t.order
          }))
        }
      });

      showToast(
        error instanceof Error ? error.message : "앨범 수정에 실패했습니다",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] w-full h-[100vh] sm:h-auto bg-black/95 border-0 sm:border sm:border-white/10 backdrop-blur-xl p-0 gap-0 sm:rounded-lg overflow-hidden z-[1000]">
        <div className="sticky top-0 backdrop-blur-xl bg-black/50 border-b border-white/10 z-10">
          <DialogHeader className="p-4 sm:p-6">
            <DialogTitle className="text-lg sm:text-xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
              앨범 수정
            </DialogTitle>
          </DialogHeader>
        </div>

        <form
          onSubmit={handleSubmit}
          className="overflow-y-auto max-h-[calc(100vh-8rem)] sm:max-h-[80vh]"
        >
          <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
            {/* 커버 이미지 섹션 */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
              <div className="relative w-32 h-32 sm:w-40 sm:h-40 mx-auto sm:mx-0 flex-shrink-0">
                <div className="absolute inset-0 rounded-xl overflow-hidden bg-gradient-to-br from-white/10 to-white/5 border border-white/10">
                  {formData.coverImage ? (
                    <Image
                      src={getImageUrl(formData.coverImage)}
                      alt="Album cover"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <IconMusic className="w-12 h-12 text-white/20" />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 space-y-4 sm:space-y-6">
                {/* 기본 정보 섹션 */}
                <div>
                  <Input
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    className="bg-transparent border-white/10 text-xl sm:text-2xl font-bold text-white h-auto py-2 px-3 focus:ring-0 focus:border-white/20"
                    placeholder="앨범 제목"
                    required
                  />
                </div>

                <div>
                  <Textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className="bg-transparent border-white/10 text-white/80 resize-none focus:ring-0 focus:border-white/20"
                    placeholder="앨범 설명"
                    rows={3}
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <Input
                    type="date"
                    value={formData.releaseDate}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        releaseDate: e.target.value,
                      }))
                    }
                    className="bg-transparent border-white/10 text-white w-full sm:w-auto focus:ring-0 focus:border-white/20"
                    required
                  />
                  <div className="flex-1 w-full">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        e.target.files?.[0] &&
                        handleImageUpload(e.target.files[0])
                      }
                      className="bg-transparent border-white/10 text-white focus:ring-0 focus:border-white/20"
                    />
                    <p className="text-xs text-white/40 mt-2">
                      권장 크기: 1000x1000px (1:1 비율)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 트랙 리스트 섹션 */}
            <div>
              <h3 className="text-base sm:text-lg font-medium text-white/80 mb-4">
                트랙 목록
              </h3>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={formData.tracks.map((t) => t.id || `new-${t.order}`)}
                  strategy={verticalListSortingStrategy}
                >
                  {formData.tracks
                    .slice()
                    .sort((a, b) => a.order - b.order)
                    .map((track, index) => (
                      <SortableTrackItem
                        key={track.id || `new-${index}`}
                        track={track}
                        index={index}
                        onTrackChange={(updatedTrack) => {
                          setFormData((prev) => ({
                            ...prev,
                            tracks: prev.tracks.map((t, i) =>
                              i === index ? updatedTrack : t
                            ),
                          }));
                        }}
                        onRemoveTrack={() => {
                          setFormData((prev) => ({
                            ...prev,
                            tracks: prev.tracks
                              .filter((t) => t.id !== track.id)
                              .map((t, i) => ({ ...t, order: i + 1 })),
                          }));
                        }}
                        onAudioUpload={handleAudioUpload}
                      />
                    ))}
                </SortableContext>
              </DndContext>

              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    tracks: [
                      ...(prev.tracks || []),
                      {
                        title: "",
                        duration: 0,
                        audioUrl: "",
                        order: (prev.tracks?.length || 0) + 1,
                      },
                    ],
                  }))
                }
                className="w-full mt-4 bg-white/5 hover:bg-white/10 text-white border-white/10 transition-all duration-300"
              >
                <IconUpload className="w-4 h-4 mr-2" />
                트랙 추가
              </Button>
            </div>

            {/* 태그 입력 섹션 추가 */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white/90">
                  태그할 사용자
                </h3>
                <p className="text-sm text-white/50">
                  앨범에 태그할 사용자를 선택해주세요
                </p>
              </div>

              <EditUserTagInput
                value={formData.taggedUserIds}
                onChange={(value) => {
                  setFormData((prev) => ({ ...prev, taggedUserIds: value }))
                }}
                initialTaggedUsers={album.taggedUsers?.map(tag => tag.user as User) || []}
              />
            </div>
          </div>

          <div className="sticky bottom-0 backdrop-blur-xl bg-black/50 border-t border-white/10 p-4 sm:p-6 flex justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isLoading}
              className="text-white hover:bg-white/10"
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-0"
            >
              {isLoading ? "저장 중..." : "저장"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
