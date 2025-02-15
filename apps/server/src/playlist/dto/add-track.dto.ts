import { IsString } from 'class-validator';

export class AddTrackDto {
  @IsString()
  trackId: string;
} 