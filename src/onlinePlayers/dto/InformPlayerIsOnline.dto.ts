import { OnlinePlayerStatus } from '../enum/OnlinePlayerStatus';
import { IsEnum, IsOptional } from 'class-validator';

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
}
