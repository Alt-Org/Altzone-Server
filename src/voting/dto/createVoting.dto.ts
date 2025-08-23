import {
  IsArray,
  IsDate,
  IsEnum,
  IsInt,
  IsMongoId,
  IsOptional,
  Min,
  ValidateNested,
} from 'class-validator';
import AddType from '../../common/base/decorator/AddType.decorator';
import { VotingType } from '../enum/VotingType.enum';
import { Vote } from '../schemas/vote.schema';
import { Type } from 'class-transformer';
import { Organizer } from './organizer.dto';
import { ItemName } from '../../clanInventory/item/enum/itemName.enum';
import SetClanRoleDto from '../../clan/role/dto/setClanRole.dto';

@AddType('CreateVotingDto')
export class CreateVotingDto {
  /**
   * Organizer information for the voting (player and optional clan)
   */
  @ValidateNested()
  @Type(() => Organizer)
  organizer: Organizer;

  /**
   * Optional voting end date
   *
   * @example "2025-05-20T12:00:00Z"
   */
  @IsDate()
  @IsOptional()
  endsOn?: Date;

  /**
   * The type/category of the voting
   *
   * @example "selling_item"
   */
  @IsEnum(VotingType)
  type: VotingType;

  /**
   * Optional minimum percentage required for the voting to pass
   *
   * @example 60
   */
  @IsInt()
  @IsOptional()
  minPercentage?: number;

  /**
   * Optional flea market item ID that the vote is tied to (e.g., item or character)
   *
   * @example "662f4f1235faaf001ef7b5cd"
   */
  @IsMongoId()
  @IsOptional()
  fleaMarketItem_id?: string;

  /**
   * Optional item name the voting is associated with
   *
   * @example "Sofa_Taakka"
   */
  @IsEnum(ItemName)
  @IsOptional()
  shopItemName?: ItemName;

  /**
   * Optional list of votes included in the voting object
   */
  @IsArray()
  @IsOptional()
  votes?: Vote[];

  /**
   * Optional type that contains the player ID and role ID
   */
  @IsOptional()
  @ValidateNested()
  @Type(() => SetClanRoleDto)
  setClanRole?: SetClanRoleDto;

  @IsOptional()
  @IsInt()
  @Min(0)
  price?: number;
}
