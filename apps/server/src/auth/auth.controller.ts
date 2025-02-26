import { Controller, Get, Req, Res, UseGuards, Post } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { Tokens } from './types/tokens.type';
import { Response } from 'express';
import { JwtGuard } from './guards/jwt.guard';
import { GetUser } from './decorators/get-user.decorator';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { RefreshTokenGuard } from './guards/refresh-token.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  private setCookies(res: Response, tokens: Tokens) {
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieDomain = isProduction ? 'ampmusic.im' : undefined; // 개발 환경에서는 도메인 설정 안 함

    // Access Token 쿠키 설정
    res.cookie('access_token', tokens.accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      ...(cookieDomain && { domain: cookieDomain }),
      maxAge: 24 * 60 * 60 * 1000, // 24시간
    });

    // Refresh Token 쿠키 설정
    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/auth/refresh',
      ...(cookieDomain && { domain: cookieDomain }),
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
    });
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Google OAuth 인증 시작
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res: Response) {
    try {
      const { id, email } = req.user;
      const tokens = await this.authService.getTokens(id, email);
      await this.authService.updateRefreshToken(id, tokens.refreshToken);

      this.setCookies(res, tokens);

      // 프론트엔드 루트 페이지로 직접 리다이렉트
      res.redirect(this.configService.get('FRONTEND_URL'));
    } catch (error) {
      res.redirect(`${this.configService.get('FRONTEND_URL')}/auth`);
    }
  }

  @Post('refresh')
  @UseGuards(RefreshTokenGuard)
  async refreshTokens(
    @GetUser('id') userId: string,
    @GetUser('refreshToken') refreshToken: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const tokens = await this.authService.refreshTokens(userId, refreshToken);

      // 새 토큰을 쿠키에 설정
      this.setCookies(res, tokens);

      return { success: true };
    } catch (error) {
      // 리프레시 토큰이 유효하지 않은 경우 쿠키 제거
      res.clearCookie('access_token');
      res.clearCookie('refresh_token');
      throw error;
    }
  }

  @Post('logout')
  @UseGuards(JwtGuard)
  async logout(@GetUser('id') userId: string, @Res() res: Response) {
    await this.authService.logout(userId);

    // 쿠키 제거
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');

    return res.sendStatus(200);
  }

  @Get('me')
  @UseGuards(JwtGuard)
  async getMe(@GetUser() user) {
    // 전체 사용자 정보를 가져오기 위해 Prisma를 사용
    const fullUserData = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        // 필요한 다른 필드들도 여기에 추가
      },
    });
    return fullUserData;
  }
}
