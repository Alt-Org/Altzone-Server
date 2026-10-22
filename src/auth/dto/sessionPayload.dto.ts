import AddType from '../../common/base/decorator/AddType.decorator';
import { ObjectId } from 'mongodb';

@AddType('SessionPayload')
export class SessionPayload {
  /**
   * Token Mongo Id
   * 
   * @example "67fe4e2d8a54d4cc39266a43"
   */
  _id: ObjectId;

  /**
   * Session Id
   * 
   * @example "67fe4e2d8a54d4cc39266a43"
   */
  session_id: string;

  /**
   * Profile Id
   * 
   * @example "67fe4e2d8a54d4cc39266a43"
   */
  profile_id: string;

  /**
   * Refresh token
   * 
   * @example "67fe4e2d8a54d4cc39266a43"
   */
  refreshToken: string;

  /**
   * Refresh token expiration
   * 
   * @example "100000"
   */
  refreshTokenExpires: number;
}
