import { ClanLogo } from '../../clan/clanLogo.schema';
import { Avatar } from '../../player/schemas/avatar.schema';

export type GlobalPlayerLeaderboardClan = {
  clanId: string;
  name: string;
  logo: ClanLogo;
};

export type GlobalPlayerLeaderboardEntry = {
  rank: number;
  wins: number;
  playerId: string;
  nickname: string;
  avatar: Avatar | null;
  clan: GlobalPlayerLeaderboardClan | null;
};

export type GlobalPlayerLeaderboardResult = {
  entries: GlobalPlayerLeaderboardEntry[];
  ownRank: number | null;
  itemCount: number;
};
