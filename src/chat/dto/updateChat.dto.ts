import { IsMongoId, IsString } from 'class-validator';
import { IsChatExists } from '../decorator/validation/IsChatExists.decorator';
import { Optional } from '@nestjs/common';
import AddType from '../../common/base/decorator/AddType.decorator';
import { ApiProperty } from '@nestjs/swagger';

@AddType('UpdateChatDto')
export class UpdateChatDto {
  /**
   * ID of the chat to update
   *
   * @example "665b1f29c3f4fa0012e7a911"
   */
  @IsChatExists()
  @IsMongoId()
  _id: string;

  /**
   * New name for the chat
   *
   * @example "Alliance Leaders"
   */
  @ApiProperty({ uniqueItems: true })
  @Optional()
  @IsString()
  name?: string;
}
