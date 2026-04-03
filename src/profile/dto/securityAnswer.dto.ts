import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";
import AddType from '../../common/base/decorator/AddType.decorator';

@AddType('SecurityAnswerDto')
export class SecurityAnswerDto {
  /**
   * Profile username
   * 
   * @example "clanHero77"
   */
  @ApiProperty()
  @IsString()
  username: string;

  /**
   * Answer used to generate recoveryToken for password reset
   * 
   * @example "Rover"
   */
  @ApiProperty()
  @IsString()
  securityAnswer: string;
}
