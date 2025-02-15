"use client";

import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { api } from "@/lib/axios";
import {
  IconEdit,
  IconHeart,
  IconSettings,
  IconWorld,
  IconShare,
  IconDotsVertical,
  IconAlertCircle,
} from "@tabler/icons-react";
import { ProfileImageUploader } from "./profile-image-uploader";
import { useToast } from "@/components/ui/toast";
import { FollowButton } from "@/components/common/FollowButton";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ReportDialog } from "../track/report-dialog";
interface ProfileData {
  id: string;
  name: string;
  avatar: string;
  bio?: string | null;
  website?: string | null;
}

export function ProfileHeader({ userId }: { userId: string }) {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { showToast } = useToast();
  const isOwnProfile = user?.id === userId;
  const [isReportOpen, setIsReportOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const { data } = await api.get(`/users/${userId}`);
        setProfile(data);
      } catch {
        setError("User not found");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  const handleUpdateProfile = async (data: {
    name?: string;
    bio?: string | null;
    website?: string | null;
  }) => {
    try {
      const { data: updatedProfile } = await api.put(`/users/${userId}`, data);
      setProfile(updatedProfile);
      setIsEditing(false);
      showToast("Profile updated successfully", "success");
    } catch {
      showToast("Failed to update profile", "error");
    }
  };

  const handleAvatarUpdate = (newAvatar: string) => {
    setProfile((prev) => (prev ? { ...prev, avatar: newAvatar } : null));
  };

  if (isLoading) {
    return <ProfileHeaderSkeleton />;
  }

  if (error || !profile) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl text-white/80">{error || "User not found"}</h2>
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10"
      >
        <div className="p-6 lg:p-8">
          <div className="flex items-start gap-6">
            <ProfileImageUploader
              userId={userId}
              currentAvatar={profile?.avatar || ""}
              onUpdate={handleAvatarUpdate}
            />
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <ProfileEditForm
                  profile={profile}
                  onSubmit={handleUpdateProfile}
                  onCancel={() => setIsEditing(false)}
                />
              ) : (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-4">
                      <h1 className="text-2xl lg:text-3xl font-bold text-white">
                        {profile.name}
                      </h1>
                      {!isOwnProfile && (
                        <div className="flex gap-2">
                          <FollowButton userId={userId} />
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                                <IconDotsVertical size={20} />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="start"
                              className="w-48 bg-black/90 border-white/10 backdrop-blur-sm"
                            >
                              <DropdownMenuItem
                                className="flex items-center gap-2 text-sm cursor-pointer text-white/80 hover:text-white focus:text-white focus:bg-white/10"
                                onClick={() => setIsReportOpen(true)}
                              >
                                <IconAlertCircle className="h-4 w-4" />
                                <span>신고하기</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      )}
                    </div>
                    {isOwnProfile && (
                      <div className="flex gap-2">
                        <button
                          className="px-4 py-2 text-sm text-white/60 hover:text-white transition-colors"
                          onClick={() => router.push("/likes")}
                        >
                          <IconHeart size={20} />
                        </button>
                        <button
                          className="px-4 py-2 text-sm text-white/60 hover:text-white transition-colors"
                          onClick={async () => {
                            await navigator.clipboard.writeText(
                              `${process.env.NEXT_PUBLIC_APP_URL}/${profile.id}`
                            );
                            showToast(
                              "링크가 클립보드에 복사되었습니다",
                              "success"
                            );
                            try {
                              await navigator.share({
                                title: profile.name,
                                text: `${profile.name}의 프로필을 방문해보세요.`,
                                url: `${process.env.NEXT_PUBLIC_APP_URL}/${profile.id}`,
                              });
                            } catch (error) {
                              showToast("링크 공유에 실패했습니다", "error");
                              console.error("Share failed:", error);
                            }
                          }}
                        >
                          <IconShare size={20} />
                        </button>
                        <button
                          onClick={() => setIsEditing(true)}
                          className="px-4 py-2 text-sm text-white/60 hover:text-white transition-colors"
                        >
                          <IconEdit size={20} />
                        </button>
                        <button
                          onClick={() => router.push("/settings")}
                          className="px-4 py-2 text-sm text-white/60 hover:text-white transition-colors"
                        >
                          <IconSettings size={20} />
                        </button>
                      </div>
                    )}
                  </div>
                  {profile.bio && (
                    <p className="text-white/60 mb-4 max-w-2xl">
                      {profile.bio}
                    </p>
                  )}
                  {profile.website && (
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors group"
                    >
                      <IconWorld
                        size={16}
                        className="group-hover:text-blue-400 transition-colors"
                      />
                      <span className="underline" title={profile.website}>
                        {formatUrl(profile.website)}
                      </span>
                    </a>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      <ReportDialog
        type="user"
        data={profile}
        open={isReportOpen}
        onOpenChange={setIsReportOpen}
      />
    </>
  );
}

interface ProfileEditFormProps {
  profile: ProfileData;
  onSubmit: (data: {
    name?: string;
    bio?: string | null;
    website?: string | null;
  }) => void;
  onCancel: () => void;
}

interface ValidationErrors {
  name?: string;
  bio?: string;
  website?: string;
}

function ProfileEditForm({
  profile,
  onSubmit,
  onCancel,
}: ProfileEditFormProps) {
  const [name, setName] = useState(profile.name);
  const [bio, setBio] = useState(profile.bio || "");
  const [website, setWebsite] = useState(profile.website || "");
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = (field: string, value: string) => {
    const newErrors: ValidationErrors = { ...errors };

    switch (field) {
      case "name":
        if (value.length < 1) {
          newErrors.name = "Name must be at least 1 character long";
        } else if (value.length > 30) {
          newErrors.name = "Name cannot exceed 30 characters";
        } else if (!/^[가-힣a-zA-Z0-9]+$/.test(value)) {
          newErrors.name =
            "Name can only contain Korean characters, English letters, and numbers";
        } else {
          delete newErrors.name;
        }
        break;

      case "bio":
        if (value.length > 160) {
          newErrors.bio = "Bio cannot exceed 160 characters";
        } else {
          delete newErrors.bio;
        }
        break;

      case "website":
        if (value) {
          try {
            const url = new URL(value);
            if (!["http:", "https:"].includes(url.protocol)) {
              newErrors.website =
                "웹사이트는 http:// 또는 https:// 로 시작해야 합니다.";
            } else if (value.length > 100) {
              newErrors.website = "웹사이트 URL은 100자를 초과할 수 없습니다.";
            } else {
              delete newErrors.website;
            }
          } catch {
            newErrors.website =
              "올바른 웹사이트 URL을 입력해주세요 (예: https://www.example.com)";
          }
        } else {
          delete newErrors.website;
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleWebsiteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    // 값이 있고, URL 프로토콜이 없는 경우에만 https:// 추가
    if (value && !value.match(/^https?:\/\//)) {
      value = `https://${value}`;
    }

    setWebsite(value);
    if (touched.website) {
      validateField("website", value);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 모든 필드 검증
    const isNameValid = validateField("name", name);
    const isBioValid = validateField("bio", bio);
    const isWebsiteValid = validateField("website", website);

    if (isNameValid && isBioValid && isWebsiteValid) {
      onSubmit({
        name,
        bio: bio.trim() || null,
        website: website || null,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <input
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (touched.name) {
              validateField("name", e.target.value);
            }
          }}
          onBlur={() => handleBlur("name")}
          className={`w-full px-3 py-2 bg-white/10 rounded-lg border ${
            errors.name && touched.name ? "border-red-500" : "border-white/10"
          } text-white`}
          placeholder="이름"
          required
        />
        {errors.name && touched.name && (
          <p className="mt-1 text-sm text-red-400">{errors.name}</p>
        )}
      </div>

      <div>
        <textarea
          value={bio}
          onChange={(e) => {
            setBio(e.target.value);
            if (touched.bio) {
              validateField("bio", e.target.value);
            }
          }}
          onBlur={() => handleBlur("bio")}
          className={`w-full px-3 py-2 bg-white/10 rounded-lg border ${
            errors.bio && touched.bio ? "border-red-500" : "border-white/10"
          } text-white resize-none`}
          placeholder="소개"
          rows={3}
        />
        {errors.bio && touched.bio && (
          <p className="mt-1 text-sm text-red-400">{errors.bio}</p>
        )}
        <p className="mt-1 text-sm text-white/60">{bio.length}/160 자</p>
      </div>

      <div>
        <input
          type="url"
          value={website}
          onChange={handleWebsiteChange}
          onBlur={() => handleBlur("website")}
          className={`w-full px-3 py-2 bg-white/10 rounded-lg border ${
            errors.website && touched.website
              ? "border-red-500"
              : "border-white/10"
          } text-white`}
          placeholder="웹사이트 URL (예: example.com)"
        />
        {errors.website && touched.website && (
          <p className="mt-1 text-sm text-red-400">{errors.website}</p>
        )}
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={Object.keys(errors).length > 0}
        >
          저장
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-white/60 hover:text-white transition-colors"
        >
          취소
        </button>
      </div>
    </form>
  );
}

function ProfileHeaderSkeleton() {
  return (
    <div className="relative rounded-2xl overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10 p-6 lg:p-8">
      <div className="flex items-start gap-6">
        <Skeleton className="w-[120px] h-[120px] rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-4 w-96 mb-6" />
        </div>
      </div>
    </div>
  );
}

function formatUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    // 길이가 30자를 넘으면 말줄임표 처리
    const displayUrl = urlObj.host + urlObj.pathname;
    return displayUrl.length > 30
      ? displayUrl.slice(0, 27) + "..."
      : displayUrl;
  } catch {
    return url;
  }
}
