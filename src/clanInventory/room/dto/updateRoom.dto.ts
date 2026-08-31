import {
  IsHexadecimal,
  IsMongoId,
  IsOptional,
  IsString,
} from 'class-validator';
import AddType from '../../../common/base/decorator/AddType.decorator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { UpdateItemDto } from '../../../clanInventory/item/dto/updateItem.dto';

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
  @IsOptional()
  roomColour?: string;

  /**
   * Updated floor type
   *
   * @example "Stone"
   */
  @IsString()
  @IsOptional()
  floorType?: string;

  /**
   * Updated wallpaper
   *
   * @example "Painted"
   */
  @IsString()
  @IsOptional()
  wallpaper?: string;

  /**
   * Room items
   */
  @Type(() => UpdateItemDto)
  @ApiProperty({ type: () => [UpdateItemDto] })
  furniture?: UpdateItemDto[];
}
