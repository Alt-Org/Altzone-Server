export interface Song {
  songId: string;
  songDurationSeconds: number;
  playerId: string;
  id: string;
}

export interface Jukebox {
  clanId: string;
  songQueue: Song[];
  currentSong: CurrentSong | null;
}

export interface CurrentSong extends Song {
  startedAt: number;
}

export type ClanId = string;
