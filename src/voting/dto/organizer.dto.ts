import { IsMongoId, IsOptional } from 'class-validator';

export class Organizer {
  @IsMongoId()
  player_id: string;

  @IsMongoId()
  @IsOptional()
  clan_id: string;
}
