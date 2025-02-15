import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class AddInquiryAnswerDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1, { message: '답변은 최소 1자 이상이어야 합니다.' })
  content: string;
} 