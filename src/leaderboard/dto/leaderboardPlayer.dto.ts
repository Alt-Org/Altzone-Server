import { Expose, Type } from 'class-transformer';
import { PlayerDto } from '../../player/dto/player.dto';
import { ClanLogoDto } from '../../clan/dto/clanLogo.dto';

export class LeaderboardPlayerDto extends PlayerDto {
  @Expose()
  @Type(() => ClanLogoDto)
  clanLogo: ClanLogoDto;
}
