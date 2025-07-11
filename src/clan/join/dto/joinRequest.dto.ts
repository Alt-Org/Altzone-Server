import { IsMongoId, IsOptional, IsString } from 'class-validator';
import { IsClanExists } from '../../../clan/decorator/validation/IsClanExists.decorator';
import AddType from '../../../common/base/decorator/AddType.decorator';

@AddType('JoinRequestDto')
export class JoinRequestDto {
  /**
   * The ID of the clan the player is attempting to join
   * @example "6643ec9cbeddb7e88fc76ae1"
   */
  @IsClanExists()
  @IsMongoId()
  clanId: string;

  /**
   * Password need to join if the clan is closed.
   * @example "P4sswrd!"
   */
  @IsString()
  @IsOptional()
  password?: string;
}
