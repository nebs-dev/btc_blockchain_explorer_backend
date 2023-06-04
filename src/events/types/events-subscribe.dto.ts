import { IsString } from 'class-validator';

export class EventsSubscribeDto {
  @IsString()
  hash?: string;

  @IsString()
  address?: string;
}
