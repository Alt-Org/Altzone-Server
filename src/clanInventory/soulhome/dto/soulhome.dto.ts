import { Expose, Type } from 'class-transformer';
import { RoomDto } from '../../room/dto/room.dto';
import AddType from '../../../common/base/decorator/AddType.decorator';
import { ExtractField } from '../../../common/decorator/response/ExtractField';
import { ApiProperty } from '@nestjs/swagger';
import { Environment } from '../../../common/enum/environment.enum';

@AddType('SoulHomeDto')
export class SoulHomeDto {
  /**
   * Unique identifier for the Soul Home
   *
   * @example "666fabc1d2f0e10012aabbcc"
   */
  @ExtractField()
  @Expose()
  @ApiProperty()
  _id: string;

  /**
   * Name of the Soul Home
   *
   * @example "Fortress of Dawn"
   */
  @Expose()
  @ApiProperty()
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
  @ApiProperty({ type: () => [RoomDto] })
  @Expose()
  Room: RoomDto[];

  /**
   * Clan that owns this Soul Home
   */
  @Type(() => ClanDto)
  @Expose()
  Clan: ClanDto;

  /**
   * Environment for the Soul Home
   */
  @Expose()
  environment?: Environment;
}
