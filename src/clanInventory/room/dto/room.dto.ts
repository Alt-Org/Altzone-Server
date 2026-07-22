import { Expose, Type } from 'class-transformer';
import AddType from '../../../common/base/decorator/AddType.decorator';
import { ExtractField } from '../../../common/decorator/response/ExtractField';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsHexadecimal } from 'class-validator';
import { ItemSummaryDto } from '../../../clanInventory/item/dto/itemSummary.dto';
import { RoomStatus } from '../enum/roomStatus.enum';

@AddType('RoomDto')
export class RoomDto {
  /**
   * Unique ID of the room
   *
   * @example "666fabc1d2f0e10012aabbcc"
   */
  @ExtractField()
  @Expose()
  @ApiProperty()
  _id: string;

  /**
   * Order of rooms
   */
  @Expose()
  @ApiProperty()
  roomPosition: number;

  /**
   * Room colour in hexadecimal
   */
  @Expose()
  @ApiProperty()
  @IsHexadecimal()
  roomColour: string;

  /**
   * Type of wall styling
   *
   * @example "Stone"
   */
  @Expose()
  @ApiProperty()
  wallpaper: string;

  /**
   * Type of flooring used
   *
   * @example "Marble"
   */
  @Expose()
  @ApiProperty()
  floor: string;

  /**
   * Room items
   */
  @Expose()
  @Type(() => ItemSummaryDto)
  @ApiProperty({ type: () => [ItemSummaryDto] })
  furniture: ItemSummaryDto[];

  /**
   * Room status
   *
   * @example Active
   */
  @Expose()
  @IsEnum(RoomStatus)
  @ApiProperty()
  roomStatus: RoomStatus;

  /**
   * Room deactivation time
   */
  @Expose()
  @ApiProperty()
  deactivationTime: Date;

  /**
   * ID of the parent Soul Home
   *
   * @example "666abc12d1e2f30012bbccdd"
   */
  @Expose()
  @ApiProperty()
  soulHome_id: string;
}
