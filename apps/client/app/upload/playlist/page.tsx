"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { createPlaylist, uploadImage } from "@/lib/api/playlist";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ImageUpload } from "@/components/upload/image-upload";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageTransition } from "@/components/ui/page-transition";
import { UserTagInput } from "@/components/tag/user-tag-input";

const playlistSchema = z.object({
  title: z.string().min(1, "제목을 입력해주세요"),
  description: z.string().optional(),
  coverImage: z.string().optional(),
  isPublic: z.boolean().default(true),
  taggedUserIds: z.array(z.string()).optional(),
});

type PlaylistFormData = z.infer<typeof playlistSchema>;

export default function CreatePlaylistPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);

  const form = useForm<PlaylistFormData>({
    resolver: zodResolver(playlistSchema),
    defaultValues: {
      isPublic: true,
      taggedUserIds: [],
    },
  });

  const onSubmit = async (data: PlaylistFormData) => {
    try {
      setIsLoading(true);

      // 1. 커버 이미지 업로드
      let coverImageUrl = "";
      if (coverImageFile) {
        const imageData = await uploadImage(coverImageFile);
        coverImageUrl = imageData.url;
      }

      // 2. 플레이리스트 생성
      const playlist = await createPlaylist({
        ...data,
        coverImage: coverImageUrl || undefined,
        taggedUserIds: data.taggedUserIds || [],
      });

      showToast("플레이리스트가 생성되었습니다.", "success");
      router.push(`/playlist/${playlist.id}`);
      router.refresh();
    } catch (error) {
      console.error("Failed to create playlist:", error);
      showToast("플레이리스트 생성에 실패했습니다.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen relative">
        {/* Background Effects - z-index만 수정 */}
        <div className="fixed inset-0 z-[-1]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]" />
        </div>

        {/* 기존 컨텐츠에 z-index 추가 */}
        <div className="relative z-[1] container max-w-3xl mx-auto py-12">
          <div className="space-y-6 px-4">
            <div className="space-y-2 text-center mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white/90">
                새로운 플레이리스트 만들기
              </h1>
              <p className="text-white/70 text-sm sm:text-base">
                나만의 음악 컬렉션을 만들어보세요
              </p>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* 플레이리스트 커버 섹션 */}
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
                      <h3 className="text-sm md:text-lg font-semibold text-white/90">
                        플레이리스트 커버
                      </h3>
                      <p className="text-xs md:text-sm text-white/50">
                        커버 이미지를 선택해주세요
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

              {/* 플레이리스트 정보 섹션 */}
              <div
                className="relative p-6 rounded-2xl bg-black/40 border border-white/[0.03]
                backdrop-blur-md transition-all group hover:bg-black/50"
              >
                <div
                  className="absolute -inset-2 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-3xl
                  opacity-0 group-hover:opacity-100 transition-opacity blur-xl"
                />

                <div className="relative space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm md:text-lg font-semibold text-white/90">
                        플레이리스트 정보
                      </h3>
                      <p className="text-xs md:text-sm text-white/50">
                        플레이리스트에 대해 설명해주세요
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
                        placeholder="플레이리스트 제목"
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
                      placeholder="플레이리스트에 대한 설명을 입력해주세요"
                      disabled={isLoading}
                      className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/40
                        focus:border-white/20 focus:ring-white/10 hover:border-white/20
                        transition-colors min-h-[120px] rounded-xl resize-none"
                    />

                    <div className="flex items-center justify-between p-4 bg-white/[0.03] rounded-xl border border-white/[0.08]">
                      <div>
                        <h3 className="text-white/90 font-medium">공개 설정</h3>
                        <p className="text-white/60 text-sm">
                          {form.watch("isPublic")
                            ? "모든 사용자가 볼 수 있습니다"
                            : "나만 볼 수 있습니다"}
                        </p>
                      </div>
                      <Switch
                        checked={form.watch("isPublic")}
                        onCheckedChange={(checked: boolean) =>
                          form.setValue("isPublic", checked)
                        }
                      />
                    </div>
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
                      플레이리스트에 태그할 사용자를 선택해주세요 (선택)
                    </p>
                  </div>

                  <UserTagInput
                    value={form.watch("taggedUserIds") || []}
                    onChange={(value) => form.setValue("taggedUserIds", value)}
                    disabled={isLoading}
                  />
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
                    <span className="text-sm md:text-lg">플레이리스트 만들기</span>
                    <span className="text-white/60">✨</span>
                  </div>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
