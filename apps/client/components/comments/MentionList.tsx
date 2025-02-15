import { User } from "@/lib/api/user";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface MentionListProps {
  users: User[];
  onSelect: (user: User) => void;
  activeIndex: number;
}

export function MentionList({ users, onSelect, activeIndex }: MentionListProps) {
  if (users.length === 0) return null;

  return (
    <div className="absolute bottom-full mb-1 w-full max-h-[200px] overflow-y-auto rounded-lg border border-white/10 bg-white/5 backdrop-blur-md">
      {users.map((user, index) => (
        <button
          key={user.id}
          className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-white/5 transition-colors
            ${activeIndex === index ? "bg-white/5" : ""}`}
          onClick={() => onSelect(user)}
        >
          <Avatar className="w-6 h-6">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>{user.name[0]}</AvatarFallback>
          </Avatar>
          <span>{user.name}</span>
        </button>
      ))}
    </div>
  );
} 