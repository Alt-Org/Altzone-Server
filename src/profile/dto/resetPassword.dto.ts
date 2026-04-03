import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";
import AddType from '../../common/base/decorator/AddType.decorator';

@AddType('ResetPasswordDto')
export class ResetPasswordDto {
  /**
   * Token required to reset password
   */
  @ApiProperty()
  @IsString()
  resetToken: string;

  /**
   * New password
   * 
   * @example "NewSecureP@ssw0rd!"
   */
  @ApiProperty()
  @IsString()
  newPassword: string;
}
