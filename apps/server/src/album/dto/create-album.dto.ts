import { IsString, IsOptional, IsDateString, IsArray } from 'class-validator';

export class CreateTrackInAlbumDto {
  title: string;
  duration: number;
  audioUrl: string;
  order: number;
  description?: string;
  lyrics?: string;
  credit?: string;
  plays?: number;
}

export class CreateAlbumDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  releaseDate: string;

  @IsString()
  @IsOptional()
  coverImage?: string;

  @IsString()
  artistId: string;

  @IsArray()
  tracks: CreateTrackInAlbumDto[];

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  taggedUserIds?: string[];
} 