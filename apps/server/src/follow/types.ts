export interface PaginatedFollowers {
  followers: Array<{
    id: string;
    name: string;
    avatar: string;
    bio: string | null;
  }>;
  total: number;
  page: number;
  totalPages: number;
} 