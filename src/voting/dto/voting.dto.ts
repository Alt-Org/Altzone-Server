import { Expose, Type } from 'class-transformer';
import { VotingType } from '../enum/VotingType.enum';
import { Vote } from '../schemas/vote.schema';
import { ExtractField } from '../../common/decorator/response/ExtractField';
import AddType from '../../common/base/decorator/AddType.decorator';
import { Organizer } from './organizer.dto';
import { ItemName } from '../../clanInventory/item/enum/itemName.enum';
import { VoteDto } from './vote.dto';
import { SetClanRole } from '../schemas/setClanRole.schema';

@AddType('VotingDto')
export class VotingDto {
  /**
   * Unique identifier of the voting session
   *
   * @example "6630ab1234cd5ef001a1b2c3"
   */
  @ExtractField()
  @Expose()
  _id: string;

  /**
   * Information about the voting organizer, including player and optional clan
   */
  @Expose()
  @Type(() => Organizer)
  organizer: Organizer;

  /**
   * Timestamp indicating when the voting officially ended
   *
   * @example "2025-05-16T14:30:00Z"
   */
  @Expose()
  endedAt: Date;

  /**
   * Timestamp indicating when the voting started
   *
   * @example "2025-05-10T09:00:00Z"
   */
  @Expose()
  startedAt: Date;

  /**
   * The scheduled time when voting should end (can be used for time limits)
   *
   * @example "2025-05-15T23:59:59Z"
   */
  @Expose()
  endsOn: Date;

  /**
   * Type of voting being conducted (e.g., item approval, clan decisions)
   *
   * @example "selling_item"
   */
  @Expose()
  type: VotingType;

  /**
   * Array of player IDs who are participating in the voting
   *
   * @example ["6630aa9994cd5ef001a1b1c2", "6630aa7774cd5ef001a1b1c3"]
   */
  @ExtractField()
  @Expose()
  player_ids: string[];

  /**
   * The minimum percentage of votes required for a decision to pass
   *
   * @example 60
   */
  @Expose()
  minPercentage: number;

  /**
   * Array of votes cast in this voting session
   */
  @Expose()
  @Type(() => VoteDto)
  votes: Vote[];

  /**
   * ID of the fleaMarketItem being voted on (e.g., item, character)
   *
   * @example "6630af1234cd5ef001a1b4c5"
   */
  @ExtractField()
  @Expose()
  fleaMarketItem_id: string;

  /**
   * Name of the item (or other entity) associated with the voting
   *
   * @example "Sofa_Taakka"
   */
  @Expose()
  shopItemName: ItemName;

  /**
   * Information about the clan role assignment for a player.
   *
   * Contains the player ID and the role ID to be assigned.
   *
   * @example { "player_id": "6630af1234cd5ef001a1b4c5", "role_id": "6630af1234cd5ef001a1b4c3" }
   */
  @Expose()
  setClanRole: SetClanRole;
}
