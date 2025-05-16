import { IsInt, IsOptional, IsString } from 'class-validator';
import AddType from '../../common/base/decorator/AddType.decorator';

@AddType('UpdateMessageDto')
export class UpdateMessageDto {
  /**
   * ID of the message to update
   *
   * @example 101
   */
  @IsInt()
  id: number;

  /**
   * Updated message content
   *
   * @example "Let’s regroup at Soul Gate!"
   */
  @IsOptional()
  @IsString()
  content?: string;

  /**
   * Updated feeling value (emotion indicator)
   *
   * @example 2
   */
  @IsOptional()
  @IsInt()
  feeling?: number;
}
