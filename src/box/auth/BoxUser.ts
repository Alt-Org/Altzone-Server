import {User} from "../../auth/user";

type BoxUserProps = {
    profile_id: string,
    player_id: string,
    box_id: string,
    groupAdmin?: boolean
}

export class BoxUser extends User{
    public constructor({profile_id, player_id, box_id, groupAdmin=false}: BoxUserProps) {
        super(profile_id, player_id);
        this.box_id = box_id;
        this.groupAdmin = groupAdmin;
    }

    public box_id: string;
    public groupAdmin = false;
}
