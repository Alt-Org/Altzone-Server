export class User {
  public constructor(profile_id: string, player_id: string, clan_id?: string) {
    this.profile_id = profile_id;
    this.player_id = player_id;
    this.clan_id = clan_id;
  }

  public readonly profile_id: string;
  public readonly player_id: string;
  public readonly clan_id?: string;
}
