import { IsArray, IsString } from 'class-validator';

export class UpdateJukeboxSongsDto {
  @IsArray()
  @IsString({ each: true })
  songs: string[];
}
