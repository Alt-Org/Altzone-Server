import { Expose, Type } from 'class-transformer';
import { ExtractField } from '../../common/decorator/response/ExtractField';
import { Language } from '../../common/enum/language.enum';
import { ClanLabel } from '../enum/clanLabel.enum';
import { AgeRange } from '../enum/ageRange.enum';
import { Goal } from '../enum/goal.enum';
import { ClanLogoDto } from './clanLogo.dto';

/**
 * DTO for displaying a clan in the public clan list.
 */
export class ClanListDto {
  /**
   * Unique identifier of the clan
   * @example "67fe4e2d8a54d4cc39266a43"
   */
  @ExtractField()
  @Expose()
  _id: string;

  /**
   * Name of the clan
   * @example "Warriors Of Light"
   */
  @Expose()
  name: string;

  /**
   * Short tag representing the clan
   * @example "WoL"
   */
  @Expose()
  tag: string;

  /** Clan logo */
  @Type(() => ClanLogoDto)
  @Expose()
  clanLogo: ClanLogoDto;

  /**
   * List of labels describing the clan
   * @example ["ELÄINRAKKAAT", "SYVÄLLISET"]
   */
  @Expose()
  labels: ClanLabel[];

  /**
   * Value of items in the clan SoulHome
   * @example 1500
   */
  @Expose()
  furnitureTotalValue: number;

  /**
   * Total battle points accumulated by the clan
   * @example 320
   */
  @Expose()
  battlePoints: number;

  /**
   * Number of players currently in the clan
   * @example 12
   */
  @Expose()
  playerCount: number;

  /**
   * Allowed age range for clan members
   * @example "All"
   */
  @Expose()
  ageRange: AgeRange;

  /**
   * Goal or purpose of the clan
   * @example "Competitive"
   */
  @Expose()
  goal: Goal;

  /**
   * Clan's motto or phrase
   * @example "Victory through unity"
   */
  @Expose()
  phrase: string;

  /**
   * Preferred language used in the clan
   * @example "English"
   */
  @Expose()
  language: Language;

  /**
   * Indicates whether players can join without admin approval
   * @example true
   */
  @Expose()
  isOpen: boolean;
}

/** Fields fetched from the database for the public clan list. */
export const clanListFields: (keyof ClanListDto)[] = [
  '_id',
  'name',
  'tag',
  'clanLogo',
  'labels',
  'furnitureTotalValue',
  'battlePoints',
  'playerCount',
  'ageRange',
  'goal',
  'phrase',
  'language',
  'isOpen',
];
