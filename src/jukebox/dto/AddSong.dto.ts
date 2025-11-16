import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class AddSongDto {
  /**
   * ID of the song stored on client.
   *
   * @example "dk39fnbjb93nb9b2nm"
   */
  @IsString()
  @IsNotEmpty()
  songId: string;

  /**
   * Duration of the song in seconds.
   *
   * @example 193
   */
  @IsInt()
  @Min(1)
  songDurationSeconds: number;
}
