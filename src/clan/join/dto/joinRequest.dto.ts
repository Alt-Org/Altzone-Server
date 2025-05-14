import { IsMongoId, IsOptional, IsString } from 'class-validator';
import { IsClanExists } from '../../../clan/decorator/validation/IsClanExists.decorator';
import AddType from '../../../common/base/decorator/AddType.decorator';
import { IsPlayerExists } from '../../../player/decorator/validation/IsPlayerExists.decorator';

@AddType('JoinRequestDto')
export class JoinRequestDto {
  /**
   * The ID of the clan the player is attempting to join
   * @example "6643ec9cbeddb7e88fc76ae1"
   */
  @IsClanExists()
  @IsMongoId()
  clan_id: string;

  /**
   * The ID of the player submitting the join request
   * @example "6643ec9cbeddb7e88fc76ae3"
   */
  @IsPlayerExists()
  @IsMongoId()
  player_id: string;

  /**
   * Optional message provided with the join request
   * @example "Looking forward to playing with you all!"
   */
  @IsString()
  @IsOptional()
  join_message: string;
}
