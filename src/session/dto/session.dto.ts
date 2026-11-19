import { IsDate, IsString } from "class-validator";
import AddType from "../../common/base/decorator/AddType.decorator";
import { ObjectId } from 'mongodb';

@AddType('SessionDto')
export class SessionDto {
  /**
   * Session ID
   */
  _id: ObjectId;

  /**
   * ID of Session shared by Sessions belonging to same session
   */
  @IsString()
  session_id: string;

  /**
   * Profile ID
   */
  profile_id: ObjectId;

  /**
   * Hashed refresh token
   */
  @IsString()
  tokenHash: string;

  /**
   * Session revocation Date
   */
  @IsDate()
  revokedAt: Date;

  /**
   * Expiration Date
   */
  @IsDate()
  expiresAt: Date;

  /**
   * Session creation Date
   */
  @IsDate()
  createdAt: Date;

  /**
   * Session update Date
   */
  @IsDate()
  updatedAt: Date
}
