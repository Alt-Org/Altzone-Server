import { IsMongoId, IsOptional } from 'class-validator';

export class Organizer {
  /**
   * ID of the player who started the vote
   *
   * @example "662f4f1235faaf001ef7b5aa"
   */
  @IsMongoId()
  player_id: string;

  /**
   * Optional ID of the clan the player belongs to
   *
   * @example "662f4f1235faaf001ef7b5ab"
   */
  @IsMongoId()
  @IsOptional()
  clan_id: string;
}
