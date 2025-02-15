import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.access_token;
        },
      ]),
      secretOrKey: configService.get('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: { sub: string; email: string }) {
    // 관리자 이메일 목록 체크
    const adminEmails = [
      'cejewe2002@gmail.com',
      // 다른 관리자 이메일들...
    ];

    const isAdmin = adminEmails.includes(payload.email);

    return {
      id: payload.sub,
      email: payload.email,
      isAdmin,
    };
  }
} 