import { Injectable } from '@nestjs/common';
import { JukeboxQueue } from './jukebox.queue';
import { ObjectId } from 'mongodb';
import JukeboxNotifier from './jukebox.notifier';
import { AddSongDto } from './dto/AddSong.dto';
import { ClanId, Jukebox, Song } from './type/playlist';
import ServiceError from '../common/service/basicService/ServiceError';
import { SEReason } from '../common/service/basicService/SEReason';
import { ClanService } from '../clan/clan.service';

@Injectable()
export class JukeboxService {
  constructor(
    private readonly scheduler: JukeboxQueue,
    private readonly notifier: JukeboxNotifier,
    private readonly clanService: ClanService,
  ) {}

  private clanJukeboxMap = new Map<ClanId, Jukebox>();

  getClanSongQueue(clanId: string) {
    const jukebox = this.clanJukeboxMap.get(clanId);
    return jukebox?.songQueue ?? [];
  }

  async addSongToClanPlaylist(
    clanId: string,
    playerId: string,
    song: AddSongDto,
  ) {
    const jukebox = this.clanJukeboxMap.get(clanId) ?? {
      clanId,
      songQueue: [],
    };
    const playerAddedSongs = jukebox.songQueue.filter(
      (song) => song.playerId === playerId,
    );

    const maxSongAmount = await this.getMaxSongAmount(clanId);
    if (playerAddedSongs.length >= maxSongAmount)
      throw new ServiceError({
        reason: SEReason.MORE_THAN_MAX,
        message: 'Players can have only 5 songs in the queue at time.',
      });

    const firstSong = jukebox.songQueue.length === 0;
    const newSong: Song = {
      playerId,
      songId: song.songId,
      songDurationSeconds: song.songDurationSeconds,
      id: new ObjectId().toString(),
    };
    jukebox.songQueue.push(newSong);
    this.clanJukeboxMap.set(clanId, jukebox);

    if (firstSong) {
      newSong.startedAt = Date.now();
      await this.notifier.songChange(
        { songId: newSong.songId, startedAt: newSong.startedAt },
        clanId,
      );
      await this.scheduler.scheduleNextSong(
        clanId,
        newSong.songDurationSeconds,
      );
    }
  }

  async startNextSong(clanId: string) {
    const jukebox = this.clanJukeboxMap.get(clanId);
    if (!jukebox) return;

    jukebox.songQueue.shift();
    if (jukebox.songQueue.length === 0) {
      this.clanJukeboxMap.delete(clanId);
      return;
    }

    const startTime = Date.now();

    const nextSong = jukebox.songQueue[0];
    nextSong.startedAt = startTime;

    await this.notifier.songChange(
      { songId: nextSong.songId, startedAt: startTime },
      clanId,
    );

    await this.scheduler.scheduleNextSong(clanId, nextSong.songDurationSeconds);
  }

  removeSongFromQueue(clanId: string, playerId: string, songId: string) {
    const jukebox = this.clanJukeboxMap.get(clanId);
    const songToRemove = jukebox.songQueue.find(
      (song) => song.id === songId && song.playerId === playerId,
    );
    if (!songToRemove) throw new ServiceError({ reason: SEReason.NOT_FOUND });

    jukebox.songQueue = jukebox.songQueue.filter((song) => song.id !== songId);
    this.clanJukeboxMap.set(clanId, jukebox);
  }

  private async getMaxSongAmount(clanId: string): Promise<number> {
    let maxSongAmount = 5;
    const [clan] = await this.clanService.readOneById(clanId);

    if (clan?.playerCount < 10) maxSongAmount = 10;

    return maxSongAmount;
  }
}
