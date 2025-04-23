import { Expose } from 'class-transformer';

export class VoteDto {
  @Expose()
  choice: string;

  @Expose()
  player_id: string;

  @Expose()
  _id: string;
}
