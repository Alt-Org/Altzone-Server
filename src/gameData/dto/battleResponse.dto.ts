import { Expose } from 'class-transformer';

export class BattleResponseDto {
  /**
   * Token required to steal items after a won battle
   *
   * @example "abc123-steal-token"
   */
  @Expose()
  stealToken: string;

  /**
   * Soul home ID where items can be stolen
   *
   * @example "665af23e5e982f0013aa7777"
   */
  @Expose()
  soulHome_id: string;

  /**
   * Rooms _ids where items can be stolen
   *
   * @example ["665af23e5e982f0013aa8888", "665af23e5e982f0013aa9999"]
   */
  @Expose()
  roomIds: string[];
}
