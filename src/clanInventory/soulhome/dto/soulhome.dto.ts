import { Expose, Type } from 'class-transformer';
import { RoomDto } from '../../room/dto/room.dto';
import { ClanDto } from '../../../clan/dto/clan.dto';
import AddType from '../../../common/base/decorator/AddType.decorator';
import { ExtractField } from '../../../common/decorator/response/ExtractField';
import { ApiProperty } from '@nestjs/swagger';

@AddType('SoulHomeDto')
export class SoulHomeDto {
  /**
   * Unique identifier for the Soul Home
   *
   * @example "666fabc1d2f0e10012aabbcc"
   */
  @ExtractField()
  @Expose()
  _id: string;

  /**
   * Name of the Soul Home
   *
   * @example "Fortress of Dawn"
   */
  @Expose()
  name: string;

  /**
   * ID of the clan that owns this Soul Home
   *
   * @example "666abc12d1e2f30012bbccdd"
   */
  @ApiProperty({ uniqueItems: true })
  @Expose()
  clan_id: string;

  /**
   * List of rooms contained in the Soul Home
   */
  @Type(() => RoomDto)
  @Expose()
  Room: RoomDto[];

  /**
   * Clan that owns this Soul Home
   */
  @Type(() => ClanDto)
  @Expose()
  Clan: ClanDto;
}
