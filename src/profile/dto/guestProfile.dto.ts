import { IsString } from "class-validator";
import AddType from "../../common/base/decorator/AddType.decorator";

@AddType('GuestProfileDto')
export class GuestProfileDto {

  /**
   * Unique username for the profile
   *
   * @example "soulmaster99"
   */
  @IsString()
  username: string;

 /**
   * Password for the profile (should be hashed before storing)
   *
   * @example "SecureP@ssw0rd!"
   */
  @IsString()
  password: string;
}