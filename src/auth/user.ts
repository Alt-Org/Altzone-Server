export class User{
    public constructor(profile_id: string, player_id: string, isSystemAdmin: boolean = false) {
        this.profile_id = profile_id;
        this.player_id = player_id;
        this.isSystemAdmin = isSystemAdmin;
    }

    public readonly profile_id: string;
    public readonly player_id: string;
    public readonly isSystemAdmin: boolean;
}