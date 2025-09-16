import { Expose } from 'class-transformer';
import { IsArray, IsString } from 'class-validator';

export class JukeboxSongsDto {
  @IsArray()
  @IsString({ each: true })
  @Expose()
  jukeboxSongs: string[];
}
