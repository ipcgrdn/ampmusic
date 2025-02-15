import { useState, useRef, KeyboardEvent } from "react";
import { useAuth } from "@/context/auth-context";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Textarea } from "../ui/textarea";
import { useToast } from "../ui/toast";
import { Loader } from "lucide-react";
import { MentionList } from "./MentionList";
import { searchUsers, User } from "@/lib/api/user";
import { useQuery } from "@tanstack/react-query";
import DOMPurify from 'isomorphic-dompurify';

export type CommentType = "ALBUM" | "PLAYLIST";

interface CommentFormProps {
  type: CommentType;
  targetId: string;
  parentId?: string;
  onSubmit: (content: string) => Promise<void>;
  onCancel?: () => void;
  placeholder?: string;
}

export function CommentForm({
  parentId,
  onSubmit,
  onCancel,
}: CommentFormProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionIndex, setMentionIndex] = useState(-1);
  const [showMentions, setShowMentions] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const maxLength = 1000;

  // 멘션 검색 쿼리
  const { data: mentionUsers = [] } = useQuery({
    queryKey: ["users", "mention", mentionQuery],
    queryFn: () => searchUsers(mentionQuery),
    enabled: showMentions && mentionQuery.length > 0,
  });

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!showMentions) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setMentionIndex((prev) =>
          prev < mentionUsers.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setMentionIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case "Enter":
        e.preventDefault();
        if (mentionIndex >= 0) {
          handleMentionSelect(mentionUsers[mentionIndex]);
        }
        break;
      case "Escape":
        setShowMentions(false);
        setMentionIndex(-1);
        break;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    if (newContent.length <= maxLength) {
      setContent(newContent);
      const position = e.target.selectionStart;
      setCursorPosition(position);

      // @ 입력 감지
      const lastAtSymbol = newContent.lastIndexOf("@", position);
      if (lastAtSymbol !== -1) {
        const query = newContent.slice(lastAtSymbol + 1, position);
        const hasSpaceAfterAt = /\s/.test(query);

        if (!hasSpaceAfterAt) {
          setMentionQuery(query);
          setShowMentions(true);
          setMentionIndex(-1);
          return;
        }
      }

      setShowMentions(false);
    }
  };

  const handleMentionSelect = (selectedUser: User) => {
    const beforeMention = content.slice(0, content.lastIndexOf("@"));
    const afterMention = content.slice(cursorPosition);
    const newContent = `${beforeMention}@${selectedUser.name} ${afterMention}`;

    setContent(newContent);
    setShowMentions(false);
    setMentionIndex(-1);

    // 커서 위치 조정
    const newPosition = beforeMention.length + selectedUser.name.length + 2;
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newPosition, newPosition);
      }
    }, 0);
  };

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (content.trim().length === 0) {
      showToast("내용을 입력해주세요.", "error");
      return;
    }

    try {
      setIsSubmitting(true);
      // 제출 전 sanitize 적용
      const sanitizedContent = DOMPurify.sanitize(content);
      await onSubmit(sanitizedContent);
      setContent("");
      showToast("댓글이 작성되었습니다.", "success");
    } catch (error) {
      console.error("Failed to submit comment:", error);
      showToast("댓글 작성에 실패했습니다.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex gap-3 py-4">
      <Avatar className="w-8 h-8">
        <AvatarImage src={user.avatar} alt={user.name} />
        <AvatarFallback>{user.name[0]}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={content}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="w-full min-h-[60px] px-3 py-2 text-sm bg-white/5 rounded-lg border border-white/10 
            resize-none transition-colors"
              placeholder={
                parentId ? "답글을 입력하세요..." : "댓글을 입력하세요..."
              }
              disabled={isSubmitting}
            />

            {showMentions && (
              <MentionList
                users={mentionUsers}
                onSelect={handleMentionSelect}
                activeIndex={mentionIndex}
              />
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">
              {content.length}/{maxLength}자
            </span>
            <div className="flex gap-2">
              {onCancel && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onCancel}
                  disabled={isSubmitting}
                >
                  취소
                </Button>
              )}
              {content && (
                <Button
                  size="sm"
                  type="submit"
                  disabled={isSubmitting || content.trim().length === 0}
                  className="bg-purple-500/80 hover:bg-purple-500"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-1">
                      <Loader className="w-4 h-4 animate-spin" />
                    </div>
                  ) : (
                    "확인"
                  )}
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
