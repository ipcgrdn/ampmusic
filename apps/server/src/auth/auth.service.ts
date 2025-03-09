import { Injectable, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { Tokens } from './types/tokens.type';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import { SearchService } from '../search/search.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly searchService: SearchService,
  ) {}

  async validateUser(email: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    return user;
  }

  async getTokens(userId: string, email: string): Promise<Tokens> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
        },
        {
          secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
          expiresIn: '24h',
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
        },
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: '30d',
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async updateRefreshToken(userId: string, refreshToken: string): Promise<void> {
    // refreshToken을 해시화하여 저장
    const hashedRefreshToken = await this.hashData(refreshToken);
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: hashedRefreshToken },
    });
  }

  private async hashData(data: string): Promise<string> {
    return bcrypt.hash(data, 10);
  }

  async validateRefreshToken(refreshToken: string, hashedRefreshToken: string): Promise<boolean> {
    return bcrypt.compare(refreshToken, hashedRefreshToken);
  }

  async refreshTokens(userId: string, refreshToken: string): Promise<Tokens> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.refreshToken) {
      throw new ForbiddenException('Access Denied');
    }

    // refreshToken 검증
    const refreshTokenMatches = await this.validateRefreshToken(
      refreshToken,
      user.refreshToken,
    );

    if (!refreshTokenMatches) {
      // 재사용 시도로 간주하고 모든 토큰 무효화
      await this.prisma.user.update({
        where: { id: userId },
        data: { refreshToken: null },
      });
      throw new ForbiddenException('Access Denied - Token reuse detected');
    }

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    
    return tokens;
  }

  async logout(userId: string): Promise<boolean> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
    return true;
  }

  async validateOAuthLogin(profile: any) {
    // 먼저 기존 유저가 있는지 확인
    const existingUser = await this.prisma.user.findUnique({
      where: { email: profile.email },
    });

    if (existingUser) {
      // 기존 유저가 있다면 업데이트하지 않고 그대로 반환
      return existingUser;
    }

    // 새로운 유저인 경우에만 생성
    const newUser = await this.prisma.user.create({
      data: {
        email: profile.email,
        name: profile.name,
        avatar: profile.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}`,
      },
    });
    
    // 새 사용자 인덱싱
    try {
      await this.searchService.indexDocument('user', newUser);
    } catch (error) {
      console.error('Failed to index new user:', error);
    }
    
    return newUser;
  }

  async generateTokens(user: User) {
    const payload = { sub: user.id, email: user.email };

    // Access Token - 24시간으로 연장
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: '24h', // 기존 15m에서 24h로 변경
    });

    // Refresh Token - 30일로 연장
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: '30d', // 기존 7d에서 30d로 변경
    });

    // Refresh Token을 데이터베이스에 저장
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    return {
      accessToken,
      refreshToken,
    };
  }
} 