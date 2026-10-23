import { IsEnum, IsOptional, IsString } from 'class-validator';
import { OnlinePlayerStatus } from '../enum/OnlinePlayerStatus';

export default class AddOnlinePlayer {
  /**
   * Player _id to be added
   */
  @IsString()
  player_id: string;

  /**
   * Player status to setAddOnlinePlayer
   *
   * @default "UI"
   */
  @IsEnum(OnlinePlayerStatus)
  @IsOptional()
  status?: OnlinePlayerStatus;

  /**
   * The version of the game client.
   * Used to isolate matchmaking pools and prevent desyncs between incompatible builds.
   * @example "1.0.4-beta"
   */
  @IsString()
  client_version: string;
}
