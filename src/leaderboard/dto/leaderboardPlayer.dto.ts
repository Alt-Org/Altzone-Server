import { Expose, Type } from 'class-transformer';
import { PlayerDto } from '../../player/dto/player.dto';
import { ClanLogoDto } from '../../clan/dto/clanLogo.dto';

export class LeaderboardPlayerDto extends PlayerDto {
  /**
   * Logo of the player's clan shown on the leaderboard
   */
  @Expose()
  @Type(() => ClanLogoDto)
  clanLogo: ClanLogoDto;
}
