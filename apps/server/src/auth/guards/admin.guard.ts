import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('인증되지 않은 사용자입니다.');
    }

    // 관리자 이메일 목록 체크
    const adminEmails = [
      'cejewe2002@gmail.com',
      // 다른 관리자 이메일들...
    ];

    const isAdmin = adminEmails.includes(user.email);

    if (!isAdmin) {
      throw new UnauthorizedException('관리자 권한이 필요합니다.');
    }

    // request에 isAdmin 플래그 추가
    request.user.isAdmin = true;

    return true;
  }
} 