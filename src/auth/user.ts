export class User{
    public constructor(profile_id: string, player_id: string) {
        this.profile_id = profile_id;
        this.player_id = player_id;
    }

    public readonly profile_id: string;
    public readonly player_id: string;
}