import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/auth-context";
import { Comment } from "@/lib/api/comment";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import {
  IconDots,
  IconPencil,
  IconTrash,
  IconHeart,
  IconAlertCircle,
} from "@tabler/icons-react";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  toggleCommentLike,
  getCommentLikeStatus,
  getCommentLikeCount,
  getReplies,
} from "@/lib/api/comment";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import { Textarea } from "../ui/textarea";
import { CommentContent } from './CommentContent';
import { MentionList } from "./MentionList";
import { searchUsers, User } from "@/lib/api/user";
import DOMPurify from 'isomorphic-dompurify';
import { ReportDialog } from "../track/report-dialog";

interface CommentItemProps {
  comment: Comment;
  onUpdate: (id: string, content: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onReply?: (parentId: string) => void;
}

export function CommentItem({
  comment,
  onUpdate,
  onDelete,
  onReply,
}: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isRepliesVisible, setIsRepliesVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const maxLength = 1000; // 최대 글자 수
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionIndex, setMentionIndex] = useState(-1);
  const [showMentions, setShowMentions] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  // 좋아요 상태 조회 - 자주 변경되지 않으므로 캐시 시간을 길게 설정
  const { data: isLiked = false } = useQuery({
    queryKey: ["comments", comment.id, "like"],
    queryFn: () => getCommentLikeStatus(comment.id),
    enabled: !!user,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5분
  });

  // 좋아요 수 조회 - 실시간성이 중요하므로 staleTime을 짧게 설정
  const { data: likeCount = 0 } = useQuery({
    queryKey: ["comments", comment.id, "likeCount"],
    queryFn: () => getCommentLikeCount(comment.id),
    retry: false,
    staleTime: 1000 * 30, // 30초
    refetchOnWindowFocus: true,
  });

  // 좋아요 토글 뮤테이션 - 낙관적 업데이트 추가
  const likeMutation = useMutation({
    mutationFn: () => toggleCommentLike(comment.id),
    onMutate: async () => {
      // 기존 쿼리 데이터 백업
      const previousLiked = queryClient.getQueryData<boolean>([
        "comments",
        comment.id,
        "like",
      ]);
      const previousCount = queryClient.getQueryData<number>([
        "comments",
        comment.id,
        "likeCount",
      ]);

      // 낙관적으로 UI 업데이트
      queryClient.setQueryData(
        ["comments", comment.id, "like"],
        !previousLiked
      );
      queryClient.setQueryData(
        ["comments", comment.id, "likeCount"],
        (old: number) => old + (previousLiked ? -1 : 1)
      );

      return { previousLiked, previousCount };
    },
    onError: (err, variables, context) => {
      // 에러 발생 시 이전 상태로 롤백
      if (context) {
        queryClient.setQueryData(
          ["comments", comment.id, "like"],
          context.previousLiked
        );
        queryClient.setQueryData(
          ["comments", comment.id, "likeCount"],
          context.previousCount
        );
      }
    },
    onSettled: () => {
      // 작업 완료 후 데이터 갱신
      queryClient.invalidateQueries({
        queryKey: ["comments", comment.id, "like"],
      });
      queryClient.invalidateQueries({
        queryKey: ["comments", comment.id, "likeCount"],
      });
    },
  });

  // 답글 조회 쿼리 - 한번 로드한 답글은 오래 캐시
  const { data: replies = [], isLoading: isLoadingReplies } = useQuery({
    queryKey: ["comments", comment.id, "replies"],
    queryFn: () => getReplies(comment.id),
    enabled: isRepliesVisible,
    staleTime: 1000 * 60 * 5, // 5분
  });

  // 멘션 검색 쿼리 추가
  const { data: mentionUsers = [] } = useQuery({
    queryKey: ["users", "mention", mentionQuery],
    queryFn: () => searchUsers(mentionQuery),
    enabled: showMentions && mentionQuery.length > 0,
  });

  // 키보드 이벤트 핸들러 추가
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
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

  // 멘션 선택 핸들러 추가
  const handleMentionSelect = (selectedUser: User) => {
    const beforeMention = editContent.slice(0, editContent.lastIndexOf("@"));
    const afterMention = editContent.slice(cursorPosition);
    const newContent = `${beforeMention}@${selectedUser.name} ${afterMention}`;

    setEditContent(newContent);
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

  // 기존의 onChange 핸들러를 수정
  const handleEditChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    if (newContent.length <= maxLength) {
      setEditContent(newContent);
      setIsDirty(true);
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

  function formatLikeCount(count: number): string {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  }

  // 수정 취소 시 경고
  const handleCancelEdit = () => {
    if (isDirty) {
      if (!confirm("작성 중인 내용이 있습니다. 취소하시겠습니까?")) {
        return;
      }
    }
    setIsEditing(false);
    setEditContent(comment.content);
    setIsDirty(false);
  };

  // 수정 핸들러
  const handleUpdate = async () => {
    if (editContent.trim().length === 0) {
      showToast("내용을 입력해주세요.", "error");
      return;
    }

    try {
      setIsSubmitting(true);
      // 수정 전 sanitize 적용
      const sanitizedContent = DOMPurify.sanitize(editContent);
      await onUpdate(comment.id, sanitizedContent);
      setIsEditing(false);
      setIsDirty(false);
      showToast("댓글이 수정되었습니다.", "success");
    } catch (error) {
      console.error("Failed to update comment:", error);
      showToast("댓글 수정에 실패했습니다.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 삭제 핸들러
  const handleDelete = async () => {
    if (!confirm("정말 삭제하시겠습니까?")) {
      return;
    }

    try {
      setIsSubmitting(true);
      await onDelete(comment.id);
      showToast("댓글이 삭제되었습니다.", "success");
    } catch (error) {
      console.error("Failed to delete comment:", error);
      showToast("댓글 삭제에 실패했습니다.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 수정 중인 내용이 있을 때 페이지 이탈 방지
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  if (comment.isDeleted) {
    return (
      <div className="py-4 text-sm text-gray-500 italic">
        삭제된 댓글입니다.
      </div>
    );
  }

  return (
    <div className="group transition-all duration-200 hover:bg-white/5 rounded-lg">
      <div className="pt-4 px-3">
        <div className="flex gap-3">
          <Avatar className="w-8 h-8 ring-2 ring-purple-500/20">
            <AvatarImage src={comment.user.avatar} alt={comment.user.name} />
            <AvatarFallback className="bg-purple-500/10">
              {comment.user.name[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Link href={`/${comment.user.id}`} className="hover:underline">
                <span className="font-medium text-sm text-white/90">
                  {comment.user.name}
                </span>
              </Link>
              <span className="text-xs text-white/40">
                {formatDistanceToNow(new Date(comment.createdAt), {
                  addSuffix: true,
                  locale: ko,
                })}
              </span>
            </div>

            {isEditing ? (
              <div className="mt-2">
                <div className="relative">
                  <Textarea
                    ref={textareaRef}
                    value={editContent}
                    onChange={handleEditChange}
                    onKeyDown={handleKeyDown}
                    className="w-full min-h-[60px] px-3 pt-2 text-sm bg-white/5 rounded-lg border border-white/10 resize-none transition-colors"
                    placeholder="댓글을 입력하세요..."
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
                    {editContent.length}/{maxLength}자
                  </span>
                  <div className="flex gap-2 mt-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCancelEdit}
                      disabled={isSubmitting}
                      className="hover:bg-white/10"
                    >
                      취소
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleUpdate}
                      disabled={isSubmitting || !isDirty}
                      className="bg-purple-500/80 hover:bg-purple-500"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-1">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          수정 중...
                        </div>
                      ) : (
                        "수정"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <CommentContent content={comment.content} mentions={comment.mentions} />
            )}
          </div>

          {!isEditing && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 hover:bg-white/5"
                >
                  <IconDots className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white/5 border-none">
                {user?.id !== comment.userId && (
                  <DropdownMenuItem onClick={() => setIsReportOpen(true)} className="text-white/80 hover:text-white focus:text-white focus:bg-white/10">
                  <IconAlertCircle className="w-4 h-4 mr-2" />
                  신고
                </DropdownMenuItem>
                )}
                {user?.id === comment.userId && (
                <DropdownMenuItem onClick={() => setIsEditing(true)} className="text-white/80 hover:text-white focus:text-white focus:bg-white/10">
                  <IconPencil className="w-4 h-4 mr-2" />
                  수정
                </DropdownMenuItem>
                )}
                {user?.id === comment.userId && (
                <DropdownMenuItem
                  className="text-red-500 hover:text-red-500 focus:text-red-500 focus:bg-red-500/10"
                  onClick={handleDelete}
                >
                  <IconTrash className="w-4 h-4 mr-2" />
                  삭제
                </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 ml-11 mt-2">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "text-xs gap-1.5",
            isLiked
              ? "text-purple-400 hover:text-purple-400 hover:bg-white/5"
              : "text-gray-400 hover:text-purple-400 hover:bg-white/5"
          )}
          onClick={() => likeMutation.mutate()}
        >
          <IconHeart
            className={cn("w-4 h-4", isLiked ? "fill-current" : "fill-none")}
          />
          {likeCount > 0 && <span>{formatLikeCount(likeCount)}</span>}
        </Button>
        {onReply && !isEditing && (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-gray-400 hover:text-white hover:bg-white/5"
            onClick={() => onReply(comment.id)}
          >
            답글 달기
          </Button>
        )}
        {comment.replyCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-gray-400 hover:text-white hover:bg-white/5"
            onClick={() => setIsRepliesVisible(!isRepliesVisible)}
          >
            {isRepliesVisible ? "답글 숨기기" : `답글 ${comment.replyCount}개`}
          </Button>
        )}
      </div>

      {/* 답글 목록 */}
      {isRepliesVisible && (
        <div className="ml-8 pl-4 border-l border-white/10">
          {isLoadingReplies ? (
            <div className="py-4">
              <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-purple-500 border-r-transparent" />
            </div>
          ) : (
            replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                onUpdate={onUpdate}
                onDelete={onDelete}
              />
            ))
          )}
        </div>
      )}

      <ReportDialog
        type="comment"
        data={comment}
        open={isReportOpen}
        onOpenChange={setIsReportOpen}
      />
    </div>
  );
}
