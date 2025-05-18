import { IsMongoId, IsNumber, IsOptional } from 'class-validator';
import AddType from '../../../common/base/decorator/AddType.decorator';

@AddType('ActivateRoomDto')
export class ActivateRoomDto {
  /**
   * List of room IDs to be activated
   *
   * @example ["666fabc1d2f0e10012aabbcc", "666fabd2d2f0e10012aabbee"]
   */
  @IsMongoId({ each: true })
  room_ids: string[];

  /**
   * Duration of activation in seconds
   *
   * @example 3600
   */
  @IsNumber()
  @IsOptional()
  durationS: number;
}
