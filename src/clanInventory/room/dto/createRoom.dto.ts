import {
  IsHexadecimal,
  IsMongoId,
  IsNumber,
  IsString,
} from 'class-validator';
import AddType from '../../../common/base/decorator/AddType.decorator';

@AddType('CreateRoomDto')
export class CreateRoomDto {
  /**
   * Order of rooms
   */
  @IsNumber()
  roomPosition: number;
  
  /**
   * Room colour in hexadecimal
   */
  @IsHexadecimal()
  roomColour: string;

  /**
   * Type of floor design used in the room
   *
   * @example "Wooden"
   */
  @IsString()
  floor: string;

  /**
   * Type of wall design used in the room
   *
   * @example "Brick"
   */
  @IsString()
  wallpaper: string;

  /**
   * ID of the Soul Home this room belongs to
   *
   * @example "666abc12d1e2f30012bbccdd"
   */
  @IsMongoId()
  soulHome_id: string;
}
