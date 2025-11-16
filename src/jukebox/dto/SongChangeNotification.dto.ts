import { Expose } from 'class-transformer';

export class SongChangeNotificationDto {
  @Expose()
  songId: string;

  @Expose()
  startedAt: number;
}
