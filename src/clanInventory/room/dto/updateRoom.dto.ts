import {
  IsHexadecimal,
  IsMongoId,
  IsOptional,
  IsString,
} from 'class-validator';
import AddType from '../../../common/base/decorator/AddType.decorator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ItemSummaryDto } from 'src/clanInventory/item/dto/itemSummary.dto';

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
   * Room colour in hexadecimal
   */
  @IsHexadecimal()
  roomColour: string;

  /**
   * Updated floor type
   *
   * @example "Stone"
   */
  @IsString()
  @IsOptional()
  floor: string;

  /**
   * Updated wallpaper
   *
   * @example "Painted"
   */
  @IsString()
  @IsOptional()
  wallpaper: string;

  /**
   * Room items
   */
  @Type(() => ItemSummaryDto)
  @ApiProperty({ type: () => [ItemSummaryDto] })
  furniture: ItemSummaryDto[];
}
