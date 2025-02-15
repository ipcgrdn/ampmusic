import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Patch,
  NotFoundException,
  InternalServerErrorException,
  UseInterceptors,
  BadRequestException,
  UploadedFile,
} from '@nestjs/common';
import { InquiryService } from './inquiry.service';
import { CreateInquiryDto } from './dto/create-inquiry.dto';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { AdminGuard } from '../auth/guards/admin.guard';
import { UpdateInquiryStatusDto } from './dto/update-inquiry-status.dto';
import { AddInquiryAnswerDto } from './dto/add-inquiry-answer.dto';
import { extname } from 'path';
import { diskStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('inquiries')
@UseGuards(JwtGuard)
export class InquiryController {
  constructor(private readonly inquiryService: InquiryService) {}

  @Get('me')
  async findMyInquiries(@GetUser('id') userId: string) {
    return this.inquiryService.findMyInquiries(userId);
  }

  @Post()
  create(@GetUser('id') userId: string, @Body() createInquiryDto: CreateInquiryDto) {
    return this.inquiryService.create(userId, createInquiryDto);
  }

  @Get()
  findAll(@GetUser('id') userId: string, @GetUser('isAdmin') isAdmin: boolean) {
    return this.inquiryService.findAll(userId, isAdmin);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @GetUser('isAdmin') isAdmin: boolean,
  ) {
    return this.inquiryService.findOne(id, userId, isAdmin);
  }

  @Patch(':id/status')
  @UseGuards(AdminGuard)
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateInquiryStatusDto,
    @GetUser('id') adminId: string,
  ) {
    try {
      return await this.inquiryService.updateStatus(id, updateStatusDto.status, adminId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('상태 업데이트 중 오류가 발생했습니다.');
    }
  }

  @Post(':id/answers')
  @UseGuards(AdminGuard)
  async addAnswer(
    @Param('id') inquiryId: string,
    @Body() answerDto: AddInquiryAnswerDto,
    @GetUser('id') adminId: string,
  ) {
    try {
      return await this.inquiryService.addAnswer(inquiryId, adminId, answerDto.content);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('답변 등록 중 오류가 발생했습니다.');
    }
  }

  @Post('upload/image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/images',
        filename: (_, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          const filename = `${randomName}${extname(file.originalname)}`;
          return cb(null, filename);
        },
      }),
      fileFilter: (_, file, cb) => {
        if (!file.mimetype.match(/^image\/(jpeg|png|gif|bmp|webp)$/)) {
          return cb(new BadRequestException('Invalid file type'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    return this.inquiryService.uploadImage(file);
  }
}
