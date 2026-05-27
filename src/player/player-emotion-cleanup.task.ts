import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Player } from './schemas/player.schema';

/**
 * Delete all emotions objects that are more than a week old, once a day.
 * Poistaa yli viikon vanhat emotion-objektit, kerran päivässä.
 */
@Injectable()
export class PlayerEmotionCleanupTask {
  private readonly logger = new Logger(PlayerEmotionCleanupTask.name);

  constructor(
    @InjectModel(Player.name)
    private readonly playerModel: Model<Player>,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handle() {
    /**
     * Date object for current date. Päivämäärä objekti nykyhetkelle.
     *
     * Subtract 7 days from current date. Vähennetään 7 päivää nykyisesta ajasta.
     */
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    /**
     * Update all player documents. Päivitä kaikki player-dokumentit.
     * Delete all emotions objects that are more than a week old. Poistaa kaikki yli viikon vanhat emotions-objektit.
     */
    const result = await this.playerModel.updateMany(
      {},
      {
        $pull: {
          emotions: {
            date: {
              $lt: sevenDaysAgo,
            },
          },
        },
      },
    );
  }
}
