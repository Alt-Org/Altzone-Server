import { Expose } from 'class-transformer';
import { ExtractField } from '../../common/decorator/response/ExtractField';

export class TaskDto {
  @ExtractField()
  @Expose()
  _id: string;

  @Expose()
  amountLeft: number;
}
