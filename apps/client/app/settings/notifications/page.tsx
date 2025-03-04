"use client";

import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/toast";
import { api } from "@/lib/axios";
import { Separator } from "@/components/ui/separator";
import { NotificationSetting } from "@/types/notification";

type NotificationSet = {
  id: string;
  title: string;
  description: string;
  type: string;
};

const NOTIFICATION_SETTINGS: NotificationSet[] = [
  {
    id: "new_album",
    title: "새 앨범",
    description: "팔로우한 아티스트가 새 앨범을 발매했을 때 알림을 받습니다",
    type: "NEW_ALBUM",
  },
  {
    id: "new_playlist",
    title: "새 플레이리스트",
    description: "팔로우한 사용자가 새 플레이리스트를 만들었을 때 알림을 받습니다",
    type: "NEW_PLAYLIST",
  },
  {
    id: "comment",
    title: "댓글",
    description: "내 앨범이나 플레이리스트에 새 댓글이 달렸을 때 알림을 받습니다",
    type: "COMMENT",
  },
  {
    id: "reply",
    title: "답글",
    description: "내 댓글에 답글이 달렸을 때 알림을 받습니다",
    type: "REPLY",
  },
  {
    id: "like",
    title: "좋아요",
    description: "내 콘텐츠에 좋아요가 달렸을 때 알림을 받습니다",
    type: "LIKE",
  },
  {
    id: "follow",
    title: "팔로우",
    description: "새로운 팔로워가 생겼을 때 알림을 받습니다",
    type: "FOLLOW",
  },
  {
    id: "mention",
    title: "멘션",
    description: "댓글에서 멘션되었을 때 알림을 받습니다",
    type: "MENTION",
  },
  {
    id: "album_tagged",
    title: "앨범 태그",
    description: "앨범에 태그되었을 때 알림을 받습니다",
    type: "ALBUM_TAGGED",
  },
  {
    id: "playlist_tagged",
    title: "플레이리스트 태그",
    description: "플레이리스트에 태그되었을 때 알림을 받습니다",
    type: "PLAYLIST_TAGGED",
  },
];

export default function NotificationSettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const [settings, setSettings] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/auth');
    }
  }, [user, router]);

  useEffect(() => {
    const fetchSettings = async () => {
      if (!user) return;

      try {
        const { data } = await api.get<NotificationSetting>(
          `/users/${user.id}/notification-settings`
        );
        
        setSettings({
          all: data.all,
          new_album: data.newAlbum,
          new_playlist: data.newPlaylist,
          comment: data.comment,
          reply: data.reply,
          like: data.like,
          follow: data.follow,
          mention: data.mention,
          album_tagged: data.album_tagged,
          playlist_tagged: data.playlist_tagged,
        });
      } catch {
        showToast("설정을 불러오는데 실패했습니다.", "error");
      } finally {
        setIsInitialLoading(false);
      }
    };

    fetchSettings();
  }, [user, showToast]);

  const handleToggle = async (settingId: string) => {
    if (!user || isLoading[settingId]) return;

    const prevSettings = { ...settings };
    
    // 즉시 UI 업데이트
    setSettings(prev => ({ 
      ...prev, 
      [settingId]: !prev[settingId],
      // 'all'이 토글되면 모든 설정을 같이 변경
      ...(settingId === 'all' ? Object.keys(prev).reduce((acc, key) => ({
        ...acc,
        [key]: !prev.all
      }), {}) : {})
    }));

    setIsLoading(prev => ({ ...prev, [settingId]: true }));

    try {
      await api.patch(`/users/${user.id}/notification-settings`, {
        type: settingId === 'all' ? 'all' : NOTIFICATION_SETTINGS.find(s => s.id === settingId)?.type,
        enabled: !prevSettings[settingId],
      });
      
      showToast("알림 설정이 변경되었습니다.", "success");
    } catch {
      // 실패시 원래 상태로 복구
      setSettings(prevSettings);
      showToast("설정 변경에 실패했습니다.", "error");
    } finally {
      setIsLoading(prev => ({ ...prev, [settingId]: false }));
    }
  };

  if (!user) return null;

  if (isInitialLoading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-7 w-32 bg-white/10 rounded mb-2" />
          <div className="h-5 w-48 bg-white/5 rounded" />
        </div>
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="h-24 bg-white/[0.03] border border-white/10 rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-white">알림 설정</h2>
        <p className="text-sm text-white/60 mt-1">
          알림을 받을 항목을 선택하세요
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between p-4 rounded-lg bg-white/[0.03] border border-white/10"> 
          <div className="space-y-1">
            <h3 className="text-xs sm:text-sm font-medium text-white">모든 알림</h3>
            <p className="text-xs sm:text-sm text-white/60">
              모든 알림을 받습니다
            </p>
          </div>
          <Switch
            checked={settings.all}
            onCheckedChange={() => handleToggle("all")}
            disabled={isLoading.all}
          />
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        {NOTIFICATION_SETTINGS.map((setting) => (
          <div
            key={setting.id}
            className="flex items-center justify-between p-4 rounded-lg bg-white/[0.03] border border-white/10 hover:bg-white/[0.04] transition-colors"
          >
            <div className="space-y-1">
              <h3 className="text-xs sm:text-sm font-medium text-white">{setting.title}</h3>
              <p className="text-xs sm:text-sm text-white/60">{setting.description}</p>
            </div>
            <Switch
              checked={settings[setting.id]}
              onCheckedChange={() => handleToggle(setting.id)}
              disabled={isLoading[setting.id]}
            />
          </div>
        ))}
      </div>
    </div>
  );
} 