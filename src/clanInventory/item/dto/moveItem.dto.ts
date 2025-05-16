import { IsMongoId, IsString, IsEnum, ValidateIf } from 'class-validator';
import { MoveTo } from '../enum/moveTo.enum';
import AddType from '../../../common/base/decorator/AddType.decorator';

@AddType('MoveItemDto')
export class MoveItemDto {
  /**
   * ID of the item to move
   *
   * @example "665a1f29c3f4fa0012e7a900"
   */
  @IsMongoId()
  @IsString()
  item_id: string;

  /**
   * Destination type: ROOM or STOCK
   *
   * @example "Stock"
   */
  @IsEnum(MoveTo)
  moveTo: MoveTo;

  /**
   * Destination ID (room or stock depending on moveTo)
   *
   * @example "666c88a7f2a98e001298cdef"
   */
  @ValidateIf((o) => o.move_to === MoveTo.ROOM)
  @IsMongoId()
  destination_id: string;
}
