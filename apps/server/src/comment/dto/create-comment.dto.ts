import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { CommentType } from '@prisma/client';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty({ message: '댓글 내용을 입력해주세요' })
  content: string;

  @IsEnum(CommentType)
  type: CommentType;

  @IsString()
  @IsNotEmpty()
  targetId: string;

  @IsString()
  @IsOptional()
  parentId?: string;
} 