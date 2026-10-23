import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsMongoId } from 'class-validator';
import { Status } from '../enum/status.enum';

export class ChangeItemStatusDto {
  /**
   *
   * @example "665af23e5e982f0013aa5566"
   */
  @IsMongoId()
  item_id: string;

  @IsIn([Status.AVAILABLE, Status.SHIPPING])
  status: Status;
}
