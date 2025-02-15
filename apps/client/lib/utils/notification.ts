import { Notification } from "@/types/notification";

export function getNotificationLink(notification: Notification): string {
  const { type, targetId, targetType } = notification;

  const getTargetPath = () => {
    switch (targetType.toUpperCase()) {
      case "ALBUM":
        return `/album/${targetId}`;
      case "PLAYLIST":
        return `/playlist/${targetId}`;
      default:
        return "/";
    }
  };

  const getLikePath = () => {
    switch (targetType.toUpperCase()) {
      case "ALBUM":
        return `/album/${targetId}`;
      case "PLAYLIST":
        return `/playlist/${targetId}`;
      case "TRACK":
        // 트랙의 경우 부모 앨범으로 이동
        return notification.parentContent
          ? `/album/${notification.parentContent.id}`
          : "/";
      default:
        return "/";
    }
  };

  switch (type) {
    case "COMMENT":
    case "REPLY":
    case "MENTION":
      return getTargetPath();
    case "LIKE":
      return getLikePath(); // 좋아요 전용 경로 처리
    case "FOLLOW":
      return `/${notification.actor.id}`;
    case "NEW_ALBUM":
      return `/album/${targetId}`;
    case "NEW_PLAYLIST":
      return `/playlist/${targetId}`;
    case "ALBUM_TAGGED":
      return `/album/${targetId}`;
    case "PLAYLIST_TAGGED":
      return `/playlist/${targetId}`;
    case "NEW_INQUIRY":
      return `/inquiries/${targetId}`;
    case "INQUIRY_ANSWERED":
      return `/inquiries/${targetId}`;
    case "INQUIRY_UPDATED":
      return `/inquiries/${targetId}`;
    default:
      return "/";
  }
}

export function getNotificationMessage(notification: Notification): string {
  const { type, content, targetType } = notification;

  switch (type) {
    case "COMMENT":
      return `님이 ${targetType.toLowerCase() === "album" ? "앨범" : "플레이리스트"}에 댓글을 남겼습니다: "${content}"`;
    case "REPLY":
      return `님이 댓글에 답글을 남겼습니다: "${content}"`;
    case "MENTION":
      return `님이 ${targetType.toLowerCase() === "album" ? "앨범" : "플레이리스트"}에서 회원님을 언급했습니다: "${content}"`;
    case "LIKE":
      return `님이 ${content}에 좋아요를 눌렀습니다`;
    case "FOLLOW":
      return content;
    case "NEW_ALBUM":
    case "NEW_PLAYLIST":
      return content;
    case "ALBUM_TAGGED":
      return content;
    case "PLAYLIST_TAGGED":
      return content;
    case "NEW_INQUIRY":
      return content;
    case "INQUIRY_ANSWERED":
      return `님이 문의에 답변을 남겼습니다: "${content}"`;
    case "INQUIRY_UPDATED":
      return `문의의 상태가 업데이트되었습니다: "${content}"`;
    default:
      return content;
  }
}
