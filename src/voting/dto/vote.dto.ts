import { Expose } from 'class-transformer';
import { ExtractField } from '../../common/decorator/response/ExtractField';

export class VoteDto {
  @Expose()
  choice: string;

  @ExtractField()
  @Expose()
  player_id: string;

  @ExtractField()
  @Expose()
  _id: string;
}
