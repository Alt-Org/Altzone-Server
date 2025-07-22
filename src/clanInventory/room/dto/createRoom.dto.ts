import {
  IsBoolean,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import AddType from '../../../common/base/decorator/AddType.decorator';

@AddType('CreateRoomDto')
export class CreateRoomDto {
  /**
   * Type of floor design used in the room
   *
   * @example "Wooden"
   */
  @IsString()
  floorType: string;

  /**
   * Type of wall design used in the room
   *
   * @example "Brick"
   */
  @IsString()
  wallType: string;

  /**
   * Indicates whether the room includes a lift
   *
   * @example true
   */
  @IsBoolean()
  @IsOptional()
  hasLift: boolean;

  /**
   * Number of cells (or zones) inside the room
   *
   * @example 9
   */
  @IsNumber()
  cellCount: number;

  /**
   * ID of the Soul Home this room belongs to
   *
   * @example "666abc12d1e2f30012bbccdd"
   */
  @IsMongoId()
  soulHome_id: string;
}
