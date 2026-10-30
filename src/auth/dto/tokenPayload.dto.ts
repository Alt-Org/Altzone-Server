import AddType from '../../common/base/decorator/AddType.decorator';

@AddType('TokenPayload')
export class TokenPayload {
  /**
   * Token Id used to find Session in DB
   *
   * @example "67fe4e2d8a54d4cc39266a43"
   */
  token_id: string;

  /**
   * Session Id to identify token family
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
   * Player Id
   *
   * @example "67fe4e2d8a54d4cc39266a43"
   */
  player_id: string;

  /**
   * Id of Box session
   */
  box_id?: string;

  /**
   * Whether user is GroupAdmin or not
   *
   * @example false
   */
  groupAdmin?: boolean;

  /**
   * Clan Id
   *
   * @example "67fe4e2d8a54d4cc39266a43"
   */
  clan_id?: string;
}
