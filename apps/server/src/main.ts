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
    // /search 경로는 CSRF 검사를 건너뜀
    if (req.path.startsWith('/search')) {
      next();
      return;
    }

    // 다른 경로들은 CSRF 검사 수행
    csrf({
      cookie: {
        key: '_csrf', // csrf 쿠키 이름 명시
        httpOnly: true, // 서버 측에서만 사용하는 쿠키
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        domain:
          process.env.NODE_ENV === 'production' ? '.ampmusic.im' : undefined, // API 서버 도메인으로 제한
      },
      ignoreMethods: ['GET', 'HEAD', 'OPTIONS'],
    })(req, res, next);
  });

  // CSRF 토큰을 응답 헤더에 포함
  app.use((req: Request, res: Response, next: NextFunction) => {
    // /search 경로는 CSRF 토큰 생성을 건너뜀
    if (req.path.startsWith('/search')) {
      next();
      return;
    }

    // csrfToken 함수가 있는 경우에만 토큰 생성
    if (req.csrfToken) {
      res.cookie('XSRF-TOKEN', req.csrfToken(), {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        domain:
          process.env.NODE_ENV === 'production' ? '.ampmusic.im' : undefined, // 루트 도메인 사용
      });
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
