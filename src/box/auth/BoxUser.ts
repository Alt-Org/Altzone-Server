import { User } from '../../auth/user';

type BoxUserProps = {
  profile_id: string;
  player_id: string;
  clan_id?: string;
  box_id: string;
  groupAdmin?: boolean;
  type?: string;
};

export class BoxUser extends User {
  public constructor({
    profile_id,
    player_id,
    clan_id,
    box_id,
    groupAdmin = false,
    type,
  }: BoxUserProps) {
    super(profile_id, player_id, clan_id);
    this.box_id = box_id;
    this.groupAdmin = groupAdmin;
    this.type = type;
  }

  public box_id: string;
  public groupAdmin = false;
  public type: string;
}
