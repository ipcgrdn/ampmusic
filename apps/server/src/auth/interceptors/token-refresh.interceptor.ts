import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../auth.service';
import { Request, Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TokenRefreshInterceptor implements NestInterceptor {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();

    // access_token 검사
    const accessToken = request.cookies['access_token'];
    if (!accessToken) {
      return next.handle();
    }

    try {
      // access_token 검증
      await this.jwtService.verifyAsync(accessToken, {
        secret: this.configService.get('JWT_ACCESS_SECRET'),
      });
      return next.handle();
    } catch (error) {
      // access_token이 만료된 경우
      const refreshToken = request.cookies['refresh_token'];
      if (!refreshToken) {
        return next.handle();
      }

      try {
        // refresh_token 검증
        const payload = await this.jwtService.verifyAsync(refreshToken, {
          secret: this.configService.get('JWT_REFRESH_SECRET'),
        });

        // 새 토큰 발급
        const tokens = await this.authService.refreshTokens(payload.sub, refreshToken);

        // 새 토큰을 쿠키에 설정
        response.cookie('access_token', tokens.accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 24 * 60 * 60 * 1000, // 24시간
        });

        response.cookie('refresh_token', tokens.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/auth/refresh',
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
        });

        // 원래 요청의 헤더 업데이트
        request.cookies['access_token'] = tokens.accessToken;
        
        return next.handle();
      } catch (refreshError) {
        // refresh_token이 유효하지 않은 경우
        response.clearCookie('access_token');
        response.clearCookie('refresh_token');
        return throwError(() => new UnauthorizedException('Invalid refresh token'));
      }
    }
  }
} 