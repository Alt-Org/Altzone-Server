import { ClanLogo } from '../../clan/clanLogo.schema';

export type GlobalClanLeaderboardEntry = {
  rank: number;
  wins: number;
  clanId: string;
  name: string;
  logo: ClanLogo | null;
};

export type GlobalClanLeaderboardResult = {
  entries: GlobalClanLeaderboardEntry[];
  ownRank: number | null;
  itemCount: number;
};
