export interface Song {
  songId: string;
  songDurationSeconds: number;
  playerId: string;
  id: string;
  startedAt?: number;
}

export interface Jukebox {
  clanId: string;
  songQueue: Song[];
}

export type ClanId = string;
