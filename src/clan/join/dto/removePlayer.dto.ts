import { IsMongoId } from 'class-validator';
import { IsPlayerExists } from '../../../player/decorator/validation/IsPlayerExists.decorator';

export class RemovePlayerDTO {
  /**
   * The ID of the player to be removed from the clan
   * @example "6643ec9cbeddb7e88fc76ae3"
   */
  @IsPlayerExists()
  @IsMongoId()
  player_id: string;
}
