import { Expose, Type } from 'class-transformer';
import { PlayerDto } from '../../player/dto/player.dto';
import { ExtractField } from '../../common/decorator/response/ExtractField';
import { Language } from '../../common/enum/language.enum';
import { AgeRange } from '../enum/ageRange.enum';
import { Goal } from '../enum/goal.enum';
import { StockDto } from '../../clanInventory/stock/dto/stock.dto';
import { SoulHomeDto } from '../../clanInventory/soulhome/dto/soulhome.dto';
import { ClanLogoDto } from './clanLogo.dto';
import ClanRoleDto from '../role/dto/clanRole.dto';
import { ClanLabel } from '../enum/clanLabel.enum';

/**
 * DTO for reading clan data.
 */
export class ClanDto {
  /**
   * Unique identifier of the clan
   *
   * @example "67fe4e2d8a54d4cc39266a43"
   */
  @ExtractField()
  @Expose()
  _id: string;

  /**
   * Name of the clan
   *
   * @example "Warriors Of Light"
   */
  @Expose()
  name: string;

  /**
   * Short tag representing the clan
   *
   * @example "WoL"
   */
  @Expose()
  tag: string;

  /**
   * Clan logo
   */
  @Type(() => ClanLogoDto)
  @Expose()
  clanLogo: ClanLogoDto;

  /**
   * List of labels describing the clan.
   * @example ["ELÄINRAKKAAT", "SYVÄLLISET"]
   */
  @Expose()
  labels: ClanLabel[];

  /**
   * Amount of game coins the clan owns
   *
   * @example 1500
   */
  @Expose()
  gameCoins: number;

  /**
   * Total points accumulated by the clan
   *
   * @example 320
   */
  @Expose()
  points: number;

  /**
   * List of user IDs that are administrators of the clan
   *
   * @example ["67fe4e2d8a54d4cc39266a41", "67fe4e2d8a54d4cc39266a42"]
   */
  @ExtractField()
  @Expose()
  admin_ids: string[];

  /**
   * Number of players currently in the clan
   *
   * @example 12
   */
  @Expose()
  playerCount: number;

  /**
   * Number of items stored by the clan
   *
   * @example 45
   */
  @Expose()
  itemCount: number;

  /**
   * Number of stock units the clan owns
   *
   * @example 9
   */
  @Expose()
  stockCount: number;

  /**
   * Allowed age range for clan members
   *
   * @example "All"
   */
  @Expose()
  ageRange: AgeRange;

  /**
   * Goal or purpose of the clan
   *
   * @example "Competitive"
   */
  @Expose()
  goal: Goal;

  /**
   * Clan's motto or phrase
   *
   * @example "Victory through unity"
   */
  @Expose()
  phrase: string;

  /**
   * Preferred language used in the clan
   *
   * @example "English"
   */
  @Expose()
  language: Language;

  /**
   * Indicates if members can join the clan without admin approvals
   *
   * @example true
   */
  @Expose()
  isOpen: boolean;

  /**
   * Password used for joining a closed clan.
   * @example "p4sswrd!"
   */
  @Expose()
  password?: string;

  /**
   * Clan roles
   */
  @Type(() => ClanRoleDto)
  @Expose()
  roles: ClanRoleDto[];

  /**
   * Clan members, optional, upon request
   */
  @Type(() => PlayerDto)
  @Expose()
  Player?: PlayerDto[];

  /**
   * Clan stock, optional, upon request
   */
  @Type(() => StockDto)
  @Expose()
  Stock?: StockDto;

  /**
   * Clan soul home, upon request
   */
  @Type(() => SoulHomeDto)
  @Expose()
  SoulHome?: SoulHomeDto;
}
