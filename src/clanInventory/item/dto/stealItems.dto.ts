import { ArrayNotEmpty, IsArray, IsMongoId, IsString } from 'class-validator';

export class StealItemsDto {
  /**
   * Token authorizing the steal action
   *
   * @example "aXJj1bE9-TOKEN-8822c"
   */
  @IsString()
  steal_token: string;

  /**
   * IDs of items to be stolen
   *
   * @example ["665a1f29c3f4fa0012e7a900", "665a1f29c3f4fa0012e7a901"]
   */
  @IsArray()
  @ArrayNotEmpty()
  @IsMongoId({ each: true })
  item_ids: string[];

  /**
   * ID of the room from which the items are stolen
   *
   * @example "666c88a7f2a98e001298cdef"
   */
  @IsMongoId()
  room_id: string;
}
