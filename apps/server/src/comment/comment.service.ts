import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentType, Comment } from '@prisma/client';
import { sanitizeContent } from '../utils/sanitize';
import { NotificationService } from '../notification/notification.service';
import { NotificationType } from '@prisma/client';

export type CommentSortType = 'latest' | 'popular';

@Injectable()
export class CommentService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) {}

  private extractMentions(content: string): string[] {
    const mentions = content.match(/@(\w+)/g) || [];
    return mentions.map((mention: string) => mention.slice(1)); // @ 제거
  }

  private async createNotificationForComment(
    comment: Comment & {
      user?: {
        id: string;
        name: string;
        avatar: string;
      };
      mentions?: {
        id: string;
        name: string;
      }[];
    },
    type: NotificationType,
    targetUserId: string,
  ) {
    if (comment.userId === targetUserId && type !== NotificationType.COMMENT) return;

    // 댓글이 달린 실제 컨텐츠 정보 조회
    const contentTarget = await this.prisma.comment.findUnique({
      where: { id: comment.id },
      include: {
        parent: {
          select: {
            targetId: true,
            type: true,
          }
        }
      }
    });

    // 답글인 경우 부모 댓글의 정보 사용
    const targetInfo = contentTarget.parentId
      ? {
          targetId: contentTarget.parent.targetId,
          type: contentTarget.parent.type,
        }
      : {
          targetId: contentTarget.targetId,
          type: contentTarget.type,
        };

    await this.notificationService.createNotificationAsync({
      type,
      content: comment.content,
      userId: targetUserId,
      actorId: comment.userId,
      targetId: targetInfo.targetId,
      targetType: targetInfo.type,
    });
  }

  async create(userId: string, createCommentDto: CreateCommentDto) {
    const sanitizedContent = sanitizeContent(createCommentDto.content);
    
    // 부모 댓글이 있는 경우 존재 여부 확인
    if (createCommentDto.parentId) {
      const parentComment = await this.prisma.comment.findUnique({
        where: { id: createCommentDto.parentId },
      });

      if (!parentComment) {
        throw new NotFoundException('부모 댓글을 찾을 수 없습니다.');
      }
    }

    const mentionedUsernames = this.extractMentions(sanitizedContent);
    const mentionedUsers = await this.prisma.user.findMany({
      where: {
        name: {
          in: mentionedUsernames,
        },
      },
    });

    const comment = await this.prisma.comment.create({
      data: {
        ...createCommentDto,
        content: sanitizedContent,
        userId,
        mentions: {
          connect: mentionedUsers.map(user => ({ id: user.id })),
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        mentions: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // 부모 댓글이 있는 경우 답글 알림 생성
    if (comment.parentId) {
      const parentComment = await this.prisma.comment.findUnique({
        where: { id: comment.parentId },
      });
      await this.createNotificationForComment(
        comment,
        NotificationType.REPLY,
        parentComment.userId,
      );
    } else {
      // 일반 댓글인 경우 컨텐츠 소유자에게 알림 생성
      const contentOwner = await this.getContentOwner(
        comment.type,
        comment.targetId
      );
      if (contentOwner) {
        await this.createNotificationForComment(
          comment,
          NotificationType.COMMENT,
          contentOwner
        );
      }
    }

    // 멘션된 사용자들에게 알림 생성
    for (const mentionedUser of mentionedUsers) {
      await this.createNotificationForComment(
        comment,
        NotificationType.MENTION,
        mentionedUser.id,
      );
    }

    return comment;
  }

  async findAll(
    type: CommentType,
    targetId: string,
    page: number = 1,
    limit: number = 10,
    sort: CommentSortType = 'latest',
  ) {
    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      this.prisma.comment.findMany({
        where: {
          type,
          targetId,
          parentId: null,
          isDeleted: false,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          mentions: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              replies: {
                where: {
                  isDeleted: false,
                },
              },
              likes: true,
            },
          },
        },
        orderBy:
          sort === 'latest'
            ? { createdAt: 'desc' }
            : { likes: { _count: 'desc' } },
        skip,
        take: limit,
      }),
      this.prisma.comment.count({
        where: {
          type,
          targetId,
          parentId: null,
          isDeleted: false,
        },
      }),
    ]);

    return {
      comments: comments.map(comment => ({
        ...comment,
        replyCount: comment._count.replies,
        likeCount: comment._count.likes,
        _count: undefined,
        replies: [],
      })),
      hasMore: skip + limit < total,
      total,
    };
  }

  async findReplies(commentId: string) {
    const replies = await this.prisma.comment.findMany({
      where: {
        parentId: commentId,
        isDeleted: false,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        mentions: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return replies;
  }

  async update(id: string, userId: string, updateCommentDto: UpdateCommentDto) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      throw new NotFoundException('댓글을 찾을 수 없습니다.');
    }

    if (comment.userId !== userId) {
      throw new BadRequestException('댓글을 수정할 권한이 없습니다.');
    }

    const sanitizedContent = sanitizeContent(updateCommentDto.content);
    const mentionedUsernames = this.extractMentions(sanitizedContent);
    const mentionedUsers = await this.prisma.user.findMany({
      where: {
        name: {
          in: mentionedUsernames,
        },
      },
    });

    return this.prisma.comment.update({
      where: { id },
      data: {
        content: sanitizedContent,
        mentions: {
          set: [],
          connect: mentionedUsers.map(user => ({ id: user.id })),
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        mentions: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async remove(id: string, userId: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      throw new NotFoundException('댓글을 찾을 수 없습니다.');
    }

    if (comment.userId !== userId) {
      throw new BadRequestException('댓글을 삭제할 권한이 없습니다.');
    }

    // 소프트 삭제 구현
    return this.prisma.comment.update({
      where: { id },
      data: { isDeleted: true },
    });
  }

  async getCommentCount(type: CommentType, targetId: string): Promise<number> {
    const count = await this.prisma.comment.count({
      where: {
        type,
        targetId,
        isDeleted: false,
      },
    });

    return count;
  }

  async toggleLike(commentId: string, userId: string): Promise<boolean> {
    const existingLike = await this.prisma.commentLike.findUnique({
      where: {
        userId_commentId: {
          userId,
          commentId,
        },
      },
    });

    if (existingLike) {
      await this.prisma.commentLike.delete({
        where: { id: existingLike.id },
      });
      return false; // unliked
    }

    // 좋아요 생성
    await this.prisma.commentLike.create({
      data: {
        userId,
        commentId,
      },
    });

    // 댓글 정보 조회
    await this.prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    return true; // liked
  }

  async getLikeCount(commentId: string): Promise<number> {
    return this.prisma.commentLike.count({
      where: { commentId },
    });
  }

  async getLikeStatus(commentId: string, userId: string): Promise<boolean> {
    const like = await this.prisma.commentLike.findUnique({
      where: {
        userId_commentId: {
          userId,
          commentId,
        },
      },
    });
    return !!like;
  }

  // 컨텐츠 소유자 ID 조회 수정
  private async getContentOwner(
    type: CommentType,
    targetId: string
  ): Promise<string | null> {
    switch (type) {
      case CommentType.ALBUM:
        const album = await this.prisma.album.findUnique({
          where: { id: targetId },
          include: {
            artist: {
              select: {
                id: true,
              }
            }
          }
        });
        return album?.artist?.id || null;

      case CommentType.PLAYLIST:
        const playlist = await this.prisma.playlist.findUnique({
          where: { id: targetId },
          include: {
            user: {
              select: {
                id: true,
              }
            }
          }
        });
        return playlist?.user?.id || null;

      default:
        return null;
    }
  }
}
