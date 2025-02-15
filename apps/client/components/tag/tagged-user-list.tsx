import { User } from '@/types/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';

interface TaggedUserListProps {
  users: User[];
  className?: string;
}

export function TaggedUserList({ users, className }: TaggedUserListProps) {
  if (!users?.length) return null;

  return (
    <div className={className}>
      <div className="relative p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] 
        backdrop-blur-sm transition-all hover:bg-white/[0.04]">
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/10 to-blue-500/10 
          rounded-[14px] opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
        
        <div className="relative flex flex-wrap items-center gap-2">
          {users.map(user => (
            <Link
              key={user.id}
              href={`/${user.id}`}
              className="inline-flex items-center px-3 py-1.5 rounded-full 
                bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 
                hover:border-white/20 transition-all duration-200 group/item"
            >
              <Avatar className="h-5 w-5 mr-2 ring-1 ring-white/10 group-hover/item:ring-white/20">
                <AvatarImage src={user.avatar || ''} />
                <AvatarFallback className="bg-white/[0.03] text-xs">
                  {user.name[0]}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium bg-gradient-to-r from-white/90 to-white/60 
                bg-clip-text text-transparent group-hover/item:from-white group-hover/item:to-white/80">
                {user.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
} 