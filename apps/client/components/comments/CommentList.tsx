import { useState } from 'react';
import { Comment } from '@/lib/api/comment';
import { CommentItem } from './CommentItem';
import { CommentForm, CommentType } from './CommentForm';
import { IconMessageOff } from '@tabler/icons-react';

interface CommentListProps {
  comments: Comment[];
  type: CommentType;
  targetId: string;
  onUpdate: (id: string, content: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onReply: (parentId: string, content: string) => Promise<void>;
}

export function CommentList({
  comments,
  type,
  targetId,
  onUpdate,
  onDelete,
  onReply,
}: CommentListProps) {
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const handleReply = async (content: string) => {
    if (!replyingTo) return;
    
    try {
      await onReply(replyingTo, content);
      setReplyingTo(null);
    } catch (error) {
      console.error('Failed to reply:', error);
    }
  };

  if (comments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-white/40">
        <IconMessageOff className="w-12 h-12 mb-4 stroke-[1.5]" />
        <p className="text-sm">아직 댓글이 없습니다</p>
        <p className="text-xs mt-1">첫 번째 댓글을 작성해보세요!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {comments.map((comment) => (
        <div key={comment.id}>
          <CommentItem
            comment={comment}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onReply={setReplyingTo}
          />
          
          {/* 답글 목록 */}
          {comment.replies.length > 0 && (
            <div className="ml-8 pl-4 border-l border-white/10">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                />
              ))}
            </div>
          )}

          {/* 답글 작성 폼 */}
          {replyingTo === comment.id && (
            <div className="ml-8 pl-4">
              <CommentForm
                type={type}
                targetId={targetId}
                parentId={comment.id}
                onSubmit={handleReply}
                onCancel={() => setReplyingTo(null)}
                placeholder="답글을 입력하세요..."
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
} 