import { ClanLogo } from '../../clan/clanLogo.schema';
import { Avatar } from '../../player/schemas/avatar.schema';

export type PlayerLeaderboardClan = {
  clanId: string;
  name: string;
  logo: ClanLogo;
};

export type PlayerLeaderboardEntry = {
  rank: number;
  wins: number;
  playerId: string;
  nickname: string;
  avatar: Avatar | null;
  clan: PlayerLeaderboardClan | null;
};

export type PlayerLeaderboardResult = {
  entries: PlayerLeaderboardEntry[];
  ownRank: number | null;
  itemCount: number;
};
