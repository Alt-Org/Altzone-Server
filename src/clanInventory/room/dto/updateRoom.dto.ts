import {
  IsBoolean,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import AddType from '../../../common/base/decorator/AddType.decorator';

@AddType('UpdateRoomDto')
export class UpdateRoomDto {
  /**
   * Unique ID of the room to update
   *
   * @example "666fabc1d2f0e10012aabbcc"
   */
  @IsMongoId()
  _id: string;

  /**
   * Updated floor type
   *
   * @example "Stone"
   */
  @IsString()
  @IsOptional()
  floorType: string;

  /**
   * Updated wall type
   *
   * @example "Painted"
   */
  @IsString()
  @IsOptional()
  wallType: string;

  /**
   * Update lift availability
   *
   * @example true
   */
  @IsBoolean()
  @IsOptional()
  hasLift: boolean;

  /**
   * Updated number of cells in the room
   *
   * @example 16
   */
  @IsNumber()
  @IsOptional()
  cellCount: number;
}
