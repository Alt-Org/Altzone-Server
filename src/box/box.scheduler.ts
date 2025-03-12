import { Injectable } from "@nestjs/common";
import BoxCreator from "./boxCreator";
import { BoxService } from "./box.service";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectModel } from "@nestjs/mongoose";
import { Box } from "./schemas/box.schema";
import { Model } from "mongoose";
import { cancelTransaction } from "../common/function/cancelTransaction";

@Injectable()
export class BoxScheduler {
	constructor(
		private readonly boxCreator: BoxCreator,
		private readonly boxService: BoxService,
		@InjectModel(Box.name) private readonly boxModel: Model<Box>
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
		const [boxes, boxErrors] = await this.boxService.getExpiredBoxes(
			currentTime
		);

		if (!boxes || boxErrors) return;

		for (const box of boxes) {
			if (box.boxRemovalTime <= currentTime.getTime()) {
				await this.boxService.deleteBox(box._id.toString());
				continue;
			}
			if (box.sessionResetTime <= currentTime.getTime()) {
				await this.resetBox(box._id.toString());
			}
		}
	}

	/**
	 * Resets a box by its ID. This involves starting a database session and transaction,
	 * retrieving the reset data for the box, deleting the existing box, and creating a new box
	 * with the reset data. If any errors occur during the delete or create operations, the transaction
	 * is canceled.
	 *
	 * @param boxId - The ID of the box to reset.
	 * @returns A promise that resolves when the box has been reset.
	 * @throws Will throw an error if the transaction cannot be completed.
	 */
	private async resetBox(boxId: string) {
		const session = await this.boxModel.db.startSession();
		session.startTransaction();

		const boxToCreate = await this.boxService.getBoxResetData(boxId);
		const [, deleteError] = await this.boxService.deleteOneById(boxId);
		if (deleteError) await cancelTransaction(session, deleteError);

		const [, createError] = await this.boxCreator.createBox(boxToCreate);
		if (createError) await cancelTransaction(session, createError);

		session.commitTransaction();
		session.endSession();
	}
}
