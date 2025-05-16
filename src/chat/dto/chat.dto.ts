import { Expose } from 'class-transformer';
import { ExtractField } from '../../common/decorator/response/ExtractField';
import AddType from '../../common/base/decorator/AddType.decorator';
import { ApiProperty } from '@nestjs/swagger';

@AddType('ChatDto')
export class ChatDto {
  /**
   * Unique ID of the chat
   *
   * @example "665b1f29c3f4fa0012e7a911"
   */
  @ExtractField()
  @Expose()
  _id: string;

  /**
   * Display name for the chat
   *
   * @example "Clan Chat"
   */
  @ApiProperty({ uniqueItems: true })
  @Expose()
  name?: string;
}
