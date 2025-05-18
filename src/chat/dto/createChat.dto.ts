import { IsString } from 'class-validator';
import { Optional } from '@nestjs/common';
import AddType from '../../common/base/decorator/AddType.decorator';
import { ApiProperty } from '@nestjs/swagger';

@AddType('CreateChatDto')
export class CreateChatDto {
  /**
   * Optional name for the new chat
   *
   * @example "Battle Room Chat"
   */
  @ApiProperty({ uniqueItems: true })
  @Optional()
  @IsString()
  name?: string;
}
