export class User {
    public constructor(username: string, profile_id: string, player_id: string) {
        this.username = username;
        this.profile_id = profile_id;
        this.player_id = player_id;
    }

    public readonly username: string;
    public readonly profile_id: string;
    public readonly player_id: string;
}