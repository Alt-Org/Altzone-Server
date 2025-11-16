import { Expose, Type } from 'class-transformer';
import { SongDto } from './songQueue.dto';

export class JukeboxDto {
  @Expose()
  @Type(() => SongDto)
  currentSong: SongDto | null;

  @Expose()
  @Type(() => SongDto)
  songQueue: SongDto[];
}
