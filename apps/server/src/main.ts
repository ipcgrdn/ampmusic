import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';
import csrf from 'csurf';
import { Request, Response, NextFunction } from 'express';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  // 개발/프로덕션 환경 확인
  const isProduction = process.env.NODE_ENV === 'production';

  // 보안 미들웨어 추가
  app.use(helmet());
  app.use(cookieParser());

  // CORS 설정
  app.enableCors({
    origin: configService.get('FRONTEND_URL'),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-XSRF-TOKEN'],
    exposedHeaders: ['X-XSRF-TOKEN', 'Content-Disposition'],
  });

  // 전역 파이프 설정
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CSRF 보호
  app.use(cookieParser());
  app.use((req: Request, res: Response, next: NextFunction) => {
    // 검색 관련 경로는 CSRF 보호에서 제외
    if (req.path.startsWith('/search')) {
      next();
      return;
    }

    // 쿠키 설정
    const cookieOptions = {
      httpOnly: true,
      sameSite: 'lax' as const,
      secure: isProduction,
      domain: isProduction ? '.ampmusic.im' : undefined,
    };

    csrf({
      cookie: cookieOptions,
      ignoreMethods: ['GET', 'HEAD', 'OPTIONS'], // 이 설정을 다시 추가
    })(req, res, next);
  });

  // CSRF 토큰을 응답 헤더에 포함
  app.use((req: Request, res: Response, next: NextFunction) => {
    // 검색 관련 경로는 제외
    if (req.path.startsWith('/search')) {
      next();
      return;
    }

    // 기존 XSRF-TOKEN 쿠키가 있다면 제거
    if (req.cookies['XSRF-TOKEN']) {
      // 환경에 따라 도메인 설정을 다르게 적용
      res.clearCookie('XSRF-TOKEN', {
        domain: isProduction ? '.ampmusic.im' : undefined,
        path: '/',
      });
    }

    // CSRF 토큰 설정
    if (req.csrfToken) {
      // 로그 추가 (디버깅 목적)
      console.log('CSRF 토큰 생성:', req.path);
      
      res.cookie('XSRF-TOKEN', req.csrfToken(), {
        httpOnly: false,
        secure: isProduction,
        sameSite: 'lax',
        path: '/',
        domain: isProduction ? '.ampmusic.im' : undefined,
      });
    } else {
      console.error('CSRF 토큰을 생성할 수 없습니다:', req.path);
    }
    
    next();
  });

  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads',
    setHeaders: (res) => {
      res.set('Cross-Origin-Resource-Policy', 'cross-origin');
      res.set('Access-Control-Allow-Origin', '*');
    },
  });

  await app.listen(configService.get('PORT') || 4000);
}
bootstrap();