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
    if (req.path.startsWith('/search')) {
      next();
      return;
    }

    // 프로덕션 환경에서만 도메인 설정
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieOptions = {
      httpOnly: true,
      sameSite: 'lax' as const,
      secure: isProduction,
      domain: isProduction ? '.ampmusic.im' : undefined,
    };

    csrf({
      cookie: cookieOptions,
      ignoreMethods: ['GET', 'HEAD', 'OPTIONS'],
    })(req, res, next);
  });

  // CSRF 토큰을 응답 헤더에 포함
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/search')) {
      next();
      return;
    }

    // 기존 XSRF-TOKEN 쿠키가 있다면 제거
    if (req.cookies['XSRF-TOKEN']) {
      res.clearCookie('XSRF-TOKEN', {
        domain: 'api.ampmusic.im',
        path: '/',
      });
    }

    if (req.csrfToken) {
      const isProduction = process.env.NODE_ENV === 'production';
      res.cookie('XSRF-TOKEN', req.csrfToken(), {
        httpOnly: false,
        secure: isProduction,
        sameSite: 'lax',
        path: '/',
        domain: isProduction ? '.ampmusic.im' : undefined,
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
