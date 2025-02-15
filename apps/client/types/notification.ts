export type NotificationType = 
  | "COMMENT" // ok
  | "REPLY" // ok
  | "MENTION" // ok
  | "LIKE"  // ok
  | "FOLLOW" // ok
  | "NEW_ALBUM"
  | "NEW_PLAYLIST"
  | "ALBUM_TAGGED"
  | "PLAYLIST_TAGGED"
  | "NEW_INQUIRY"
  | "INQUIRY_ANSWERED"
  | "INQUIRY_UPDATED";

export interface Notification {
  id: string;
  type: NotificationType;
  content: string;
  isRead: boolean;
  createdAt: string;
  actor: {
    id: string;
    name: string;
    avatar: string;
  };
  targetId: string;
  targetType: string;
  parentContent?: {
    id: string;
    type: string;
  };
}

export interface NotificationPage {
  notifications: Notification[];
  hasMore: boolean;
  total: number;
}

export interface NotificationSetting {
  id: string;
  userId: string;
  all: boolean;
  newAlbum: boolean;
  newPlaylist: boolean;
  comment: boolean;
  reply: boolean;
  like: boolean;
  follow: boolean;
  mention: boolean;
  album_tagged: boolean;
  playlist_tagged: boolean;
  createdAt: Date;
  updatedAt: Date;
} 