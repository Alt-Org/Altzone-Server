import AddType from '../../common/base/decorator/AddType.decorator';
import { CreatePlayerDto } from '../../player/dto/createPlayer.dto';
import { IsProfileExists } from '../decorator/validation/IsProfileExists.decorator';
import { IsMongoId, IsOptional } from 'class-validator';

@AddType('PlayerProfileDto')
export class PlayerProfileDto extends CreatePlayerDto {
  /**
   * Existing profile ID to associate the player with
   *
   * @example "662a1b2cd7a64f12e0e1aef9"
   */
  @IsProfileExists()
  @IsMongoId()
  @IsOptional()
  override profile_id: string;
}
