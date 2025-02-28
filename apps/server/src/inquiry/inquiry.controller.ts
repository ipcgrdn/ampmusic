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
import { diskStorage, memoryStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import { S3Service, FILE_VALIDATION_RULES } from '../utils/s3-upload.util';

@Controller('inquiries')
@UseGuards(JwtGuard)
export class InquiryController {
  private readonly s3Service: S3Service;
  private readonly isProduction: boolean;

  constructor(private readonly inquiryService: InquiryService) {
    this.s3Service = new S3Service();
    this.isProduction = process.env.NODE_ENV === 'production';
  }

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
      storage: process.env.NODE_ENV === 'production'
        ? memoryStorage()
        : diskStorage({
            destination: './uploads/images',
            filename: (_, file, cb) => {
              const randomName = Array(32)
                .fill(null)
                .map(() => Math.round(Math.random() * 16).toString(16))
                .join('');
              return cb(null, `${randomName}${extname(file.originalname)}`);
            },
          }),
      limits: {
        fileSize: FILE_VALIDATION_RULES.image.maxSize,
      },
      fileFilter: (_, file, cb) => {
        if (!FILE_VALIDATION_RULES.image.allowedMimeTypes.includes(file.mimetype as 'image/jpeg' | 'image/png' | 'image/jpg' | 'image/webp')) {
          return cb(new BadRequestException('지원하지 않는 이미지 형식입니다'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('파일이 없습니다.');
    }

    if (this.isProduction) {
      return this.s3Service.uploadFile(file, 'images');
    }
    return this.inquiryService.uploadImage(file);
  }
}
