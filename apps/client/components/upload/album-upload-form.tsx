"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createAlbum, uploadImage, uploadAudio } from "@/lib/api/album";
import { ImageUpload } from "./image-upload";
import { TrackUpload } from "./track-upload";
import { UserTagInput } from "../tag/user-tag-input";

// Track 타입을 TrackUpload 컴포넌트와 공유
interface Track {
  file: File;
  title: string;
  duration: number;
  order: number;
  description?: string;
  lyrics?: string;
  credit?: string;
}

const albumSchema = z.object({
  title: z.string().min(1, "제목을 입력해주세요"),
  description: z.string().optional(),
  releaseDate: z.string(),
  coverImage: z.string().optional(),
  tracks: z
    .array(
      z.object({
        title: z.string(),
        duration: z.number(),
        audioUrl: z.string(),
        order: z.number(),
        description: z.string().optional(),
        lyrics: z.string().optional(),
        credit: z.string().optional(),
      })
    )
    .min(1, "최소 1개의 트랙이 필요합니다"),
  taggedUserIds: z.array(z.string()).optional(),
});

type AlbumFormData = z.infer<typeof albumSchema>;

export function AlbumUploadForm() {
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [trackFiles, setTrackFiles] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<AlbumFormData>({
    resolver: zodResolver(albumSchema),
    defaultValues: {
      tracks: [],
      taggedUserIds: [],
    },
  });

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    form.setValue("releaseDate", today);
  }, [form]);

  useEffect(() => {
    form.setValue(
      "tracks",
      trackFiles.map((track) => ({
        title: track.title,
        duration: track.duration,
        audioUrl: "",
        order: track.order,
        description: track.description,
        lyrics: track.lyrics,
        credit: track.credit,
      }))
    );
  }, [trackFiles, form]);

  const onSubmit = async (data: AlbumFormData) => {
    if (!user) {
      showToast("로그인이 필요합니다.", "error");
      return;
    }

    if (trackFiles.length === 0) {
      showToast("최소 1개의 트랙이 필요합니다.", "error");
      return;
    }

    try {
      setIsLoading(true);
      // 1. 커버 이미지 업로드
      let coverImageUrl = "";
      if (coverImageFile) {
        try {
          const imageData = await uploadImage(coverImageFile);
          coverImageUrl = imageData.url;
        } catch {
          showToast("커버 이미지 업로드에 실패했습니다.", "error");
          return;
        }
      }

      // 2. 트랙 파일 업로드
      const uploadedTracks = await Promise.all(
        trackFiles.map(async (track) => {
          const audioData = await uploadAudio(track.file);
          return {
            title: track.title,
            duration: audioData.duration,
            audioUrl: audioData.url,
            order: track.order,
            description: track.description,
            lyrics: track.lyrics,
            credit: track.credit,
          };
        })
      );

      // 3. 앨범 생성
      const album = await createAlbum({
        ...data,
        coverImage: coverImageUrl,
        artistId: user.id,
        tracks: uploadedTracks,
        taggedUserIds: data.taggedUserIds || [],
      });

      console.log(album);

      showToast("앨범이 성공적으로 업로드되었습니다.", "success");
      router.push(`/album/${album.id}`);
    } catch (error) {
      console.error("Album upload error:", error);
      showToast("앨범 업로드에 실패했습니다.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
      {/* 앨범 커버 섹션 */}
      <div
        className="relative p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05]
        backdrop-blur-sm transition-all group hover:bg-white/[0.04]"
      >
        <div
          className="absolute -inset-2 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-3xl
          opacity-0 group-hover:opacity-100 transition-opacity blur-xl"
        />

        <div className="relative space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm md:text-lg font-semibold text-white/90">앨범 커버</h3>
              <p className="text-xs md:text-sm text-white/50">
                고화질 이미지를 사용하는 것을 추천드려요
              </p>
              <p className="text-xs md:text-sm text-white/30">
                최대 5MB 제한, jpg/jpeg/png/webp 형식 지원
              </p>
            </div>
            <div className="h-8 w-8 rounded-full bg-white/[0.05] flex items-center justify-center">
              <span className="text-white/70">1</span>
            </div>
          </div>

          <ImageUpload
            value={form.watch("coverImage") || ""}
            onChange={(file) => setCoverImageFile(file)}
            disabled={isLoading}
            className="w-full aspect-square max-w-[300px] mx-auto flex items-center justify-center"
          />
        </div>
      </div>

      {/* 앨범 정보 섹션 */}
      <div
        className="relative p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05]
        backdrop-blur-sm transition-all group hover:bg-white/[0.04]"
      >
        <div
          className="absolute -inset-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl
          opacity-0 group-hover:opacity-100 transition-opacity blur-xl"
        />

        <div className="relative space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm md:text-lg font-semibold text-white/90">앨범 정보</h3>
              <p className="text-xs md:text-sm text-white/50">
                앨범에 대해 자세히 알려주세요
              </p>
            </div>
            <div className="h-8 w-8 rounded-full bg-white/[0.05] flex items-center justify-center">
              <span className="text-white/70">2</span>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <Input
                {...form.register("title")}
                placeholder="앨범 제목"
                disabled={isLoading}
                className="bg-white/[0.03] border-white/[0.08] text-lg text-white placeholder:text-white/40
                  focus:border-white/20 focus:ring-white/10 hover:border-white/20
                  transition-colors h-12 rounded-xl"
              />
              {form.formState.errors.title && (
                <p className="text-sm text-red-400/90">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>

            <Textarea
              {...form.register("description")}
              placeholder="앨범에 대한 설명을 입력해주세요"
              disabled={isLoading}
              className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/40
                focus:border-white/20 focus:ring-white/10 hover:border-white/20
                transition-colors min-h-[120px] rounded-xl resize-none"
            />
          </div>
        </div>
      </div>

      {/* 태그 입력 섹션 */}
      <div
        className="relative p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05]
        backdrop-blur-sm transition-all group hover:bg-white/[0.04]"
      >
        <div
          className="absolute -inset-2 bg-gradient-to-r from-indigo-500/10 to-blue-500/10 rounded-3xl
          opacity-0 group-hover:opacity-100 transition-opacity blur-xl"
        />

        <div className="relative space-y-4">
          <div>
            <h3 className="text-sm md:text-lg font-semibold text-white/90">
              태그할 사용자
            </h3>
            <p className="text-xs md:text-sm text-white/50">
              앨범에 태그할 사용자를 선택해주세요 (선택)
            </p>
          </div>

          <UserTagInput
            value={form.watch("taggedUserIds") || []}
            onChange={(value) => form.setValue("taggedUserIds", value)}
            disabled={isLoading}
          />
        </div>
      </div>

      {/* 트랙 업로드 섹션 */}
      <div
        className="relative p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05]
        backdrop-blur-sm transition-all group hover:bg-white/[0.04]"
      >
        <div
          className="absolute -inset-2 bg-gradient-to-r from-indigo-500/10 to-blue-500/10 rounded-3xl
          opacity-0 group-hover:opacity-100 transition-opacity blur-xl"
        />

        <div className="relative space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm md:text-lg font-semibold text-white/90">트랙 목록</h3>
              <p className="text-xs md:text-sm text-white/50">
                앨범에 포함될 트랙들을 추가해주세요
              </p>
              <p className="text-xs md:text-sm text-white/30">
                최대 20MB 제한, mp3/wav/flac/aac/ogg 형식 지원
              </p>
            </div>
            <div className="h-8 w-8 rounded-full bg-white/[0.05] flex items-center justify-center">
              <span className="text-white/70">3</span>
            </div>
          </div>

          <TrackUpload
            value={trackFiles}
            onChange={setTrackFiles}
            disabled={isLoading}
          />
          {form.formState.errors.tracks && (
            <p className="text-sm text-red-400/90">
              {form.formState.errors.tracks.message}
            </p>
          )}
        </div>
      </div>

      {/* 제출 버튼 */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-14 bg-gradient-to-r from-white/10 to-white/20 
          hover:from-white/20 hover:to-white/30 border border-white/[0.08]
          hover:border-white/20 text-black text-lg font-medium rounded-xl shadow-lg
          transition-all duration-300"
      >
        {isLoading ? (
          <div className="flex items-center justify-center gap-2">
            <span className="animate-spin">⏳</span>
            <span>업로드 중...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm md:text-lg">앨범 출시하기</span>
            <span className="text-white/60">✨</span>
          </div>
        )}
      </Button>
    </form>
  );
}