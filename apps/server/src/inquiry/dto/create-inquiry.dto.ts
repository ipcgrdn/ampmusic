import { IsEnum, IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { InquiryType } from '@prisma/client';

export class CreateInquiryDto {
  @IsEnum(InquiryType)
  type: InquiryType;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsOptional()
  attachmentUrl?: string;
} 