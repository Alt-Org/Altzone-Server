import { Expose } from 'class-transformer';
import AddType from '../../common/base/decorator/AddType.decorator';

@AddType('TokenPayload')
export class TokenPayload {
  /**
   * Profile Id
   * 
   * @example "67fe4e2d8a54d4cc39266a43"
   */
  @Expose()
  profile_id: string;

  /**
   * Player Id
   * 
   * @example "67fe4e2d8a54d4cc39266a43"
   */
  @Expose()
  player_id: string;

  /**
   * Id of Box session
   */
  @Expose()
  box_id?: string;

  /**
   * Whether user is GroupAdmin or not
   * 
   * @example false
   */
  @Expose()
  groupAdmin?: boolean;

  /**
   * Token version
   * 
   * @example 0
   */
  @Expose()
  tokenVersion: number;

  /**
   * Clan Id
   * 
   * @example "67fe4e2d8a54d4cc39266a43"
   */
  @Expose()
  clan_id?: string;
}
