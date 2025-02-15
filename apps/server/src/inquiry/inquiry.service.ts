import { Injectable, NotFoundException, UnauthorizedException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInquiryDto } from './dto/create-inquiry.dto';
import { InquiryStatus } from '@prisma/client';
import { NotificationService } from '../notification/notification.service';
import sharp from 'sharp';
import * as fs from 'fs/promises';

@Injectable()
export class InquiryService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) {}

  async create(userId: string, createInquiryDto: CreateInquiryDto) {
    try {
      if (createInquiryDto.attachmentUrl) {
        const isValidImageUrl = /\.(jpg|jpeg|png|gif|webp)$/i.test(createInquiryDto.attachmentUrl);
        if (!isValidImageUrl) {
          throw new Error('지원하지 않는 이미지 형식입니다.');
        }
      }

      const inquiry = await this.prisma.inquiry.create({
        data: {
          ...createInquiryDto,
          user: {
            connect: { id: userId },
          },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      const admins = await this.prisma.user.findMany({
        where: {
          email: {
            in: ['cejewe2002@gmail.com'],
          },
        },
      });

      for (const admin of admins) {
        await this.notificationService.create({
          type: 'NEW_INQUIRY',
          userId: admin.id,
          actorId: userId,
          content: `새로운 문의가 등록되었습니다: ${inquiry.title}`,
          targetId: inquiry.id,
          targetType: 'Inquiry',
          parentContent: {
            id: inquiry.id,
            type: 'Inquiry',
          },
        });
      }

      return inquiry;
    } catch (error) {
      if (error.message === '지원하지 않는 이미지 형식입니다.') {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException('문의 생성 중 오류가 발생했습니다.');
    }
  }

  async findAll(userId: string, isAdmin: boolean) {
    if (isAdmin) {
      return this.prisma.inquiry.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          answers: {
            include: {
              admin: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    return this.prisma.inquiry.findMany({
      where: {
        userId,
      },
      include: {
        answers: {
          include: {
            admin: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string, userId: string, isAdmin: boolean) {
    const inquiry = await this.prisma.inquiry.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        answers: {
          include: {
            admin: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!inquiry) {
      throw new NotFoundException('문의를 찾을 수 없습니다.');
    }

    if (!isAdmin && inquiry.userId !== userId) {
      throw new UnauthorizedException('이 문의에 접근할 권한이 없습니다.');
    }

    return inquiry;
  }

  async updateStatus(id: string, status: InquiryStatus, adminId: string) {
    const inquiry = await this.prisma.inquiry.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!inquiry) {
      throw new NotFoundException('문의를 찾을 수 없습니다.');
    }

    const updatedInquiry = await this.prisma.inquiry.update({
      where: { id },
      data: { 
        status,
        adminNote: `Status updated to ${status} by admin`,
      },
    });

    await this.notificationService.create({
      type: 'INQUIRY_UPDATED',
      userId: inquiry.userId,
      actorId: adminId,
      content: `문의 상태가 ${status}로 변경되었습니다.`,
      targetId: inquiry.id,
      targetType: 'Inquiry',
      parentContent: {
        id: inquiry.id,
        type: 'Inquiry',
      },
    });

    return updatedInquiry;
  }

  async addAnswer(inquiryId: string, adminId: string, content: string) {
    const inquiry = await this.prisma.inquiry.findUnique({
      where: { id: inquiryId },
      include: { user: true },
    });

    if (!inquiry) {
      throw new NotFoundException('문의를 찾을 수 없습니다.');
    }

    const answer = await this.prisma.inquiryAnswer.create({
      data: {
        content,
        inquiry: {
          connect: { id: inquiryId },
        },
        admin: {
          connect: { id: adminId },
        },
      },
      include: {
        admin: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    await this.notificationService.create({
      type: 'INQUIRY_ANSWERED',
      userId: inquiry.userId,
      actorId: adminId,
      content: '문의에 대한 답변이 등록되었습니다.',
      targetId: inquiry.id,
      targetType: 'Inquiry',
      parentContent: {
        id: inquiry.id,
        type: 'Inquiry',
      },
    });

    return answer;
  }

  async uploadImage(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('파일이 없습니다');
    }

    const optimized = await sharp(file.path)
      .resize(800, 800, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: 80 })
      .toBuffer();

    await fs.writeFile(file.path, optimized);

    return {
      url: `/uploads/images/${file.filename}`,
    };
  }

  async findMyInquiries(userId: string) {
    return this.prisma.inquiry.findMany({
      where: {
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        answers: {
          include: {
            admin: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
} 