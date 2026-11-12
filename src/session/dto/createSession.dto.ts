import { IsDate, IsString } from "class-validator";
import AddType from "../../common/base/decorator/AddType.decorator";
import { ObjectId } from 'mongodb';

@AddType('CreateSessionDto')
export class CreateSessionDto {
  /**
   * Session ID tied to refresh token token_id
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
  @IsString()
  profile_id: string;
  
  /**
   * Hashed refresh token
   */
  @IsString()
  tokenHash: string;
  
  /**
   * Expiration Date
   */
  @IsDate()
  expiresAt: Date;
}
