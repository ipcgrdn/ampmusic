import Link from "next/link";
import DOMPurify from 'isomorphic-dompurify';

interface CommentContentProps {
  content: string;
  mentions?: {
    id: string;
    name: string;
  }[];
}

export function CommentContent({ content, mentions = [] }: CommentContentProps) {
  // @username 패턴을 찾아서 분리
  const parts = content.split(/(@\w+)/g);

  return (
    <p className="mt-1 text-sm text-white/80 leading-relaxed">
      {parts.map((part, i) => {
        if (part.startsWith('@')) {
          const username = part.slice(1); // @ 제거
          const mentionedUser = mentions.find(user => user.name === username);
          
          if (mentionedUser) {
            return (
              <Link
                key={i}
                href={`/${mentionedUser.id}`}
                className="text-purple-400 hover:underline"
              >
                {DOMPurify.sanitize(part)}
              </Link>
            );
          }
        }
        return DOMPurify.sanitize(part);
      })}
    </p>
  );
} 