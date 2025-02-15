import { IsString, IsOptional, MinLength, MaxLength, IsUrl, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'Name must be at least 1 character long' })
  @MaxLength(30, { message: 'Name cannot exceed 30 characters' })
  @Matches(/^[가-힣a-zA-Z0-9]+$/, {
    message: 'Name can only contain Korean characters, English letters, and numbers',
  })
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160, { message: 'Bio cannot exceed 160 characters' })
  @Transform(({ value }) => {
    if (value === undefined || value === null) return value;
    const trimmed = value.trim();
    return trimmed === '' ? null : trimmed;
  })
  bio?: string | null;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => {
    if (value === undefined || value === null) return value;
    const trimmed = value.trim();
    return trimmed === '' ? null : trimmed;
  })
  @IsUrl({
    protocols: ['http', 'https'],
    require_protocol: true,
    require_valid_protocol: true,
  }, { 
    message: 'Please enter a valid website URL starting with http:// or https://',
  })
  @MaxLength(100, { message: 'Website URL cannot exceed 100 characters' })
  website?: string | null;

  @IsOptional()
  @IsString()
  @IsUrl({
    protocols: ['http', 'https'],
    require_protocol: true,
  }, {
    message: 'Avatar must be a valid URL',
  })
  avatar?: string;
} 