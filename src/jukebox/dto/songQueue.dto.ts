import { Expose } from 'class-transformer';
import { ExtractField } from '../../common/decorator/response/ExtractField';

export class SongDto {
  /**
   * Id of the song entry
   *
   * @example "60f7c2d9a2d3c7b7e56d01ca"
   */
  @Expose()
  @ExtractField()
  id: string;

  /**
   * Id of the song
   */
  @Expose()
  songId: string;

  /**
   * Id of player who added the song to the queue.
   *
   * @example "60f7c2d9a2d3c7b7e56d01df"
   */
  @Expose()
  playerId: string;

  /**
   * UNIX timestamp in milli seconds when song started to play
   * @example 1760793361467
   */
  @Expose()
  startedAt: number;
}
