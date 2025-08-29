import { IsIn, IsMongoId } from 'class-validator';
import { Status } from '../enum/status.enum';

export class ChangeItemStatusDto {
  @IsMongoId()
  item_id: string;

  @IsIn([Status.AVAILABLE, Status.SHIPPING])
  status: Status;
}
