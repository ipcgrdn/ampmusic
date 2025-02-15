import { useCallback, useEffect, useState } from "react";
import {
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { CommentList } from "./CommentList";
import { CommentForm, CommentType } from "./CommentForm";
import {
  createComment,
  getComments,
  updateComment,
  deleteComment,
} from "@/lib/api/comment";
import { CommentSkeleton } from "./CommentSkeleton";
import { useInView } from "react-intersection-observer";
import { CommentSortType } from "@/lib/api/comment";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface CommentSectionProps {
  type: CommentType;
  targetId: string;
}

export function CommentSection({ type, targetId }: CommentSectionProps) {
  const { ref, inView } = useInView();
  const queryClient = useQueryClient();
  const commentsQueryKey = ["comments", type, targetId];
  const [sort, setSort] = useState<CommentSortType>("latest");

  // 무한 스크롤 쿼리
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteQuery({
      queryKey: ["comments", type, targetId, sort],
      queryFn: ({ pageParam = 1 }) =>
        getComments(type, targetId, pageParam, 10, sort),
      getNextPageParam: (lastPage, pages) => {
        if (!lastPage.hasMore) return undefined;
        return pages.length + 1;
      },
      initialPageParam: 1,
    });

  // 스크롤이 하단에 도달하면 다음 페이지 로드
  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage]);

  const comments = data?.pages.flatMap((page) => page.comments) ?? [];
  const totalComments = data?.pages[0]?.total ?? 0;

  // 댓글 작성
  const createMutation = useMutation({
    mutationFn: (content: string) => createComment({ type, targetId, content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commentsQueryKey });
    },
  });

  // 댓글 수정
  const updateMutation = useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) =>
      updateComment(id, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commentsQueryKey });
    },
  });

  // 댓글 삭제
  const deleteMutation = useMutation({
    mutationFn: deleteComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commentsQueryKey });
    },
  });

  // 답글 작성
  const replyMutation = useMutation({
    mutationFn: ({
      parentId,
      content,
    }: {
      parentId: string;
      content: string;
    }) => createComment({ type, targetId, parentId, content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commentsQueryKey });
    },
  });

  // 핸들러 함수들
  const handleCreate = useCallback(
    async (content: string) => {
      await createMutation.mutateAsync(content);
    },
    [createMutation]
  );

  const handleUpdate = useCallback(
    async (id: string, content: string) => {
      await updateMutation.mutateAsync({ id, content });
    },
    [updateMutation]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      await deleteMutation.mutateAsync(id);
    },
    [deleteMutation]
  );

  const handleReply = useCallback(
    async (parentId: string, content: string) => {
      await replyMutation.mutateAsync({ parentId, content });
    },
    [replyMutation]
  );

  if (status === "pending") {
    return <CommentSkeleton />;
  }

  return (
    <div className="space-y-6 mx-12">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">
          댓글 <span className="text-gray-400">({totalComments})</span>
        </h3>

        <Select
          value={sort}
          onValueChange={(value: CommentSortType) => setSort(value)}
        >
          <SelectTrigger className="w-[120px] bg-white/5 border-white/10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-white/10">
            <SelectItem value="latest" className="focus:bg-white/5">최신순</SelectItem>
            <SelectItem value="popular" className="focus:bg-white/5">인기순</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="backdrop-blur-md bg-white/5 rounded-lg border border-white/10 p-4">
        <CommentForm type={type} targetId={targetId} onSubmit={handleCreate} />
      </div>

      <div className="backdrop-blur-md bg-white/5 rounded-lg border border-white/10 p-4">
        <CommentList
          comments={comments}
          type={type}
          targetId={targetId}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          onReply={handleReply}
        />

        {/* 무한 스크롤 로딩 인디케이터 */}
        {isFetchingNextPage && (
          <div className="py-4 text-center">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-purple-500 border-r-transparent" />
          </div>
        )}

        {/* Intersection Observer 타겟 */}
        <div ref={ref} className="h-4" />
      </div>
    </div>
  );
}
