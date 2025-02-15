import { IsString, IsOptional, IsBoolean, IsArray } from 'class-validator';

export class CreatePlaylistDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  coverImage?: string;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean = true;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  taggedUserIds?: string[];
} 