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
    const cookieDomain = isProduction ? '.ampmusic.im' : undefined;

    // Access Token 쿠키 설정
    res.cookie('access_token', tokens.accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      domain: cookieDomain,
      maxAge: 24 * 60 * 60 * 1000, // 24시간
    });

    // Refresh Token 쿠키 설정
    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/auth/refresh',
      domain: cookieDomain,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
    });
  }

  private clearAllCookies(res: Response) {
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieDomain = isProduction ? '.ampmusic.im' : undefined;

    // Access Token 쿠키 제거
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      domain: cookieDomain,
    });

    // Refresh Token 쿠키 제거
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/auth/refresh',
      domain: cookieDomain,
    });

    // CSRF 토큰 쿠키 제거
    res.clearCookie('XSRF-TOKEN', {
      httpOnly: false,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      domain: cookieDomain,
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
      this.setCookies(res, tokens);
      return { success: true };
    } catch (error) {
      this.clearAllCookies(res);
      throw error;
    }
  }

  @Post('logout')
  @UseGuards(JwtGuard)
  async logout(@GetUser('id') userId: string, @Res() res: Response) {
    await this.authService.logout(userId);
    this.clearAllCookies(res);
    return res.sendStatus(200);
  }

  @Get('me')
  @UseGuards(JwtGuard)
  async getMe(@GetUser() user) {
    const fullUserData = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
      },
    });
    return fullUserData;
  }
}