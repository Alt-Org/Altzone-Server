import { IsString, MinLength } from 'class-validator';

export class CreateGroupAdminDto {
  /**
   * Unique admin password to be set for the testing box.
   *
   * @example "my-password"
   */
  @IsString()
  @MinLength(1)
  password: string;
}
