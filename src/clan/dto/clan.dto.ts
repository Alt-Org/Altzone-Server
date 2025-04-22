import { Expose, Type } from 'class-transformer';
import { PlayerDto } from '../../player/dto/player.dto';
import { ExtractField } from '../../common/decorator/response/ExtractField';
import AddType from '../../common/base/decorator/AddType.decorator';
import { Language } from '../../common/enum/language.enum';
import { AgeRange } from '../enum/ageRange.enum';
import { Goal } from '../enum/goal.enum';
import { StockDto } from '../../clanInventory/stock/dto/stock.dto';
import { SoulHomeDto } from '../../clanInventory/soulhome/dto/soulhome.dto';
import { ClanLogoDto } from './clanLogo.dto';
import ClanRoleDto from '../role/dto/clanRole.dto';

@AddType('ClanDto')
export class ClanDto {
  @ExtractField()
  @Expose()
  _id: string;

  @Expose()
  name: string;

  @Expose()
  tag: string;

  @Type(() => ClanLogoDto)
  @Expose()
  clanLogo: ClanLogoDto;

  @Expose()
  labels: string[];

  @Expose()
  gameCoins: number;

  @Expose()
  points: number;

  @Expose()
  admin_ids: string[];

  @Expose()
  playerCount: number;

  @Expose()
  itemCount: number;

  @Expose()
  stockCount: number;

  @Expose()
  ageRange: AgeRange;

  @Expose()
  goal: Goal;

  @Expose()
  phrase: string;

  @Expose()
  language: Language;

  @Expose()
  isOpen: boolean;

  @Type(() => ClanRoleDto)
  @Expose()
  roles: ClanRoleDto[];

  @Type(() => PlayerDto)
  @Expose()
  Player: PlayerDto[];

  @Type(() => StockDto)
  @Expose()
  Stock: StockDto;

  @Type(() => SoulHomeDto)
  @Expose()
  SoulHome: SoulHomeDto;
}
