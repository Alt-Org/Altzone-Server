import { Expose } from 'class-transformer';
import AddType from '../../../common/base/decorator/AddType.decorator';
import { ExtractField } from '../../../common/decorator/response/ExtractField';

@AddType('RoomDto')
export class RoomDto {
  /**
   * Unique ID of the room
   *
   * @example "666fabc1d2f0e10012aabbcc"
   */
  @ExtractField()
  @Expose()
  _id: string;

  /**
   * Type of flooring used
   *
   * @example "Marble"
   */
  @Expose()
  floorType: string;

  /**
   * Type of wall styling
   *
   * @example "Stone"
   */
  @Expose()
  wallType: string;

  /**
   * Whether the room is currently active
   *
   * @example true
   */
  @Expose()
  isActive: boolean;

  /**
   * Whether the room has a lift feature
   *
   * @example false
   */
  @Expose()
  hasLift: boolean;

  /**
   * Unix timestamp of when the room will be deactivated
   *
   * @example 1715950000
   */
  @Expose()
  deactivationTimestamp: number;

  /**
   * Number of interactive cells in the room
   *
   * @example 12
   */
  @Expose()
  cellCount: number;

  /**
   * ID of the parent Soul Home
   *
   * @example "666abc12d1e2f30012bbccdd"
   */
  @Expose()
  soulHome_id: string;
}
