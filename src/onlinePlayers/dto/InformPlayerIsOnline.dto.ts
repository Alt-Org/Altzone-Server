import { OnlinePlayerStatus } from '../enum/OnlinePlayerStatus';
import { IsEnum, IsOptional, IsString, IsNotEmpty } from 'class-validator';

export default class InformPlayerIsOnlineDto {
  /**
   * What players is doing or where the player is in the game.
   *
   * @example "BattleWait"
   * @default "UI"
   */
  @IsOptional()
  @IsEnum(OnlinePlayerStatus)
  status?: OnlinePlayerStatus;

  /**
   * The version of the game client.
   * Required to ensure version-compatible matchmaking.
   * @example "0.6.2"
   */
  @IsString()
  @IsNotEmpty()
  client_version: string;
}
