import { IsString, IsOptional, IsBoolean, MaxLength, IsArray } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdatePlaylistDto {
  @IsString({ message: '제목을 입력해주세요' })
  @MaxLength(100, { message: '제목은 100자를 넘을 수 없습니다' })
  @Transform(({ value }) => value?.trim())
  title?: string;

  @IsOptional()
  @IsString({ message: '설명은 문자열이어야 합니다' })
  @MaxLength(1000, { message: '설명은 1000자를 넘을 수 없습니다' })
  @Transform(({ value }) => value?.trim())
  description?: string;

  @IsOptional()
  @IsString({ message: '이미지 경로가 올바르지 않습니다' })
  coverImage?: string;

  @IsOptional()
  @IsBoolean({ message: '공개 여부는 boolean 값이어야 합니다' })
  isPublic?: boolean;

  @IsOptional()
  @IsArray({ message: '태그된 사용자는 배열이어야 합니다' })
  @IsString({ each: true, message: '태그된 사용자는 문자열이어야 합니다' })
  taggedUserIds?: string[];
} 
