import { Controller, Post, Get, Patch, Delete, Param, Body, UseGuards, BadRequestException, Query } from '@nestjs/common';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { CommentService, CommentSortType } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { CommentType } from '@prisma/client';

@Controller('comments')
@UseGuards(JwtGuard)
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post(':id/like')
  async toggleLike(
    @Param('id') id: string,
    @GetUser('id') userId: string,
  ) {
    try {
      return await this.commentService.toggleLike(id, userId);
    } catch (error) {
      throw new BadRequestException('좋아요를 처리할 수 없습니다.');
    }
  }

  @Get(':id/like')
  async getLikeStatus(
    @Param('id') id: string,
    @GetUser('id') userId: string,
  ) {
    try {
      return await this.commentService.getLikeStatus(id, userId);
    } catch (error) {
      throw new BadRequestException('좋아요 상태를 확인할 수 없습니다.');
    }
  }

  @Get(':id/like/count')
  async getLikeCount(@Param('id') id: string) {
    try {
      return await this.commentService.getLikeCount(id);
    } catch (error) {
      throw new BadRequestException('좋아요 수를 확인할 수 없습니다.');
    }
  }

  @Get(':id/replies')
  async getReplies(@Param('id') id: string) {
    try {
      return await this.commentService.findReplies(id);
    } catch (error) {
      throw new BadRequestException('답글을 불러올 수 없습니다.');
    }
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @Body() updateCommentDto: UpdateCommentDto
  ) {
    return this.commentService.update(id, userId, updateCommentDto);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @GetUser('id') userId: string
  ) {
    return this.commentService.remove(id, userId);
  }

  @Post()
  create(
    @GetUser('id') userId: string,
    @Body() createCommentDto: CreateCommentDto
  ) {
    return this.commentService.create(userId, createCommentDto);
  }

  @Get(':type/:targetId')
  findAll(
    @Param('type') type: CommentType,
    @Param('targetId') targetId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('sort') sort: CommentSortType = 'latest',
  ) {
    if (!Object.values(CommentType).includes(type)) {
      throw new BadRequestException('잘못된 댓글 타입입니다.');
    }
    return this.commentService.findAll(
      type, 
      targetId, 
      parseInt(page), 
      parseInt(limit),
      sort,
    );
  }

  @Get(':type/:targetId/count')
  async getCommentCount(
    @Param('type') type: CommentType,
    @Param('targetId') targetId: string,
  ) {
    if (!Object.values(CommentType).includes(type)) {
      throw new BadRequestException('잘못된 댓글 타입입니다.');
    }
    return this.commentService.getCommentCount(type, targetId);
  }
} 