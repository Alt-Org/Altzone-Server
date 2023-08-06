export class User{
    public constructor(username: string, profile_id: string, player_id: string, isSystemAdmin: boolean = false) {
        this.username = username;
        this.profile_id = profile_id;
        this.player_id = player_id;
        this.isSystemAdmin = isSystemAdmin;
    }

    public readonly username: string;
    public readonly profile_id: string;
    public readonly player_id: string;
    public readonly isSystemAdmin: boolean;
}