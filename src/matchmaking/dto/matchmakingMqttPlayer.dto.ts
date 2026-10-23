import { Expose, Type } from 'class-transformer';
import { AvatarDto } from '../../player/dto/avatar.dto';

export class MatchmakingMqttPlayerDto {
  /**
   * Player ID.
   *
   * @example "665af23e5e982f0013aa4455"
   */
  @Expose()
  playerId: string;

  /**
   * Player display name.
   *
   * @example "Player 1"
   */
  @Expose()
  name: string;

  /**
   * Player avatar data used by the client UI.
   */
  @Expose()
  @Type(() => AvatarDto)
  avatar?: AvatarDto | null;
}
