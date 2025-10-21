import { Expose, Type } from 'class-transformer';
import { SongDto } from './songQueue.dto';
import { CurrentSong, Song } from '../type/playlist';

export class JukeboxDto {
  @Expose()
  @Type(() => SongDto)
  currentSong: CurrentSong | null;

  @Expose()
  @Type(() => SongDto)
  songQueue: Song[];
}
