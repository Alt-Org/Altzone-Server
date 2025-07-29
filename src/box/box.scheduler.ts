import { Injectable } from '@nestjs/common';
import BoxCreator from './boxCreator';
import { BoxService } from './box.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Box } from './schemas/box.schema';
import { Model } from 'mongoose';

@Injectable()
export class BoxScheduler {
  constructor(
    private readonly boxCreator: BoxCreator,
    private readonly boxService: BoxService,
    @InjectModel(Box.name) private readonly boxModel: Model<Box>,
  ) {}

  /**
   * Resets testing sessions by deleting all boxes that have reached the end session stage.
   *
   * This method performs the following steps:
   * 1. Reads all boxes with a session stage of `SessionStage.END`.
   * 2. If there are no errors, deletes each box by its ID.
   *
   * @returns A promise that resolves when the operation is complete.
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async resetTestingSessions() {
    const currentTime = new Date();
    const [boxes, boxErrors] =
      await this.boxService.getExpiredBoxes(currentTime);

    if (!boxes || boxErrors) return;

    for (const box of boxes) {
      if (box.boxRemovalTime <= currentTime.getTime()) {
        await this.boxService.deleteBox(box._id.toString());
        continue;
      }
      if (box.sessionResetTime <= currentTime.getTime()) {
        await this.boxService.reset(box._id.toString());
      }
    }
  }
}
