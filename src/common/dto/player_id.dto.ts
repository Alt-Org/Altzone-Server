import { IsMongoId } from 'class-validator';
import { IsPlayerExists } from '../../player/decorator/validation/IsPlayerExists.decorator';

/**
 * Class for validating the incoming _id by checking it's a valid mongo_id and that the player with that _id exists.
 *
 * Typically used to check url parameter.
 */
export class PlayerIdDto {
  /**
   * Player _id
   *
   * @example "663a5d9cde9f1a0012f3b456"
   */
  @IsMongoId()
  @IsPlayerExists()
  _id: string;
}
