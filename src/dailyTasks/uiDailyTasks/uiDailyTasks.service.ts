import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { DailyTask } from "../dailyTasks.schema";
import { Model } from "mongoose";
import BasicService from "../../common/service/basicService/BasicService";
import { UIDailyTaskData, uiDailyTasks } from "./uiDailyTasks";
import { IServiceReturn } from "../../common/service/basicService/IService";
import ServiceError from "../../common/service/basicService/ServiceError";
import { SEReason } from "../../common/service/basicService/SEReason";
import { DailyTaskDto } from "../dto/dailyTask.dto";
import { PlayerRewarder } from "../../rewarder/playerRewarder/playerRewarder.service";
import { UITaskName } from "../enum/uiTaskName.enum";
import { cancelTransaction } from "../../common/function/cancelTransaction";

@Injectable()
export default class UIDailyTasksService {
	constructor(
		@InjectModel(DailyTask.name) public readonly model: Model<DailyTask>,
		private readonly playerRewarder: PlayerRewarder
	) {
		this.basicService = new BasicService(model);
	}

	private readonly basicService: BasicService;

	/**
	 * Creates an array containing daily tasks for UI side managed tasks.
	 *
	 * Notice that player_id will be set to null
	 *
	 * @param clan_id _id of the clan
	 * @returns an array containing daily tasks for UI side managed tasks or REQUIRED if clan_id is not provided
	 */
	public getUITasksForClan(
		clan_id: string
	): IServiceReturn<Omit<DailyTask, "_id">[]> {
		if (!clan_id)
			return [
				null,
				[
					new ServiceError({
						reason: SEReason.REQUIRED,
						field: "clan_id",
						value: clan_id,
						message: "clan_id is required",
					}),
				],
			];

		const tasks: Omit<DailyTask, "_id">[] = [];
		for (const taskName in uiDailyTasks) {
			const base: UIDailyTaskData = uiDailyTasks[taskName];
			const task: Omit<DailyTask, "_id"> = {
				...base,
				clan_id,
				player_id: null,
				startedAt: null,
				amountLeft: base.amount,
			};
			tasks.push(task);
		}
		return [tasks, null];
	}

	/**
	 * Updates the daily task for a given player. Decrements the amount left for the task.
	 *
	 * @param player_id - The ID of the player whose task is being updated.
	 * @param amount - Amount of completed atomic tasks, default is 1
	 * @returns The updated task and status or ServiceErrors if any occurred.
	 */
	async updateTask(
		player_id: string,
		amount = 1
	): Promise<IServiceReturn<["updated" | "completed", DailyTask]>> {
		const [task, error] = await this.basicService.readOne<DailyTaskDto>({
			filter: { player_id },
		});
		if (error) return [null, error];
		if (!Object.values(UITaskName).includes(task.type as UITaskName)) {
			return [
				null,
				[
					new ServiceError({
						reason: SEReason.WRONG_ENUM,
						field: "task.type",
						value: task.type,
						message: `Only UI tasks can be progressed through this endpoint.`,
					}),
				],
			];
		}

		task.amountLeft -= amount;

		if (task.amountLeft <= 0) return [["completed", task], null];

		const [_, updateError] = await this.basicService.updateOne(task, {
			filter: { player_id },
		});
		if (updateError) return [null, updateError];

		return [["updated", task], null];
	}

	/**
	 * Handles the progression of a player's task by updating its progress and rewarding the player
	 *
	 * @param playerId - The unique identifier of the player whose task is being progressed.
	 * @param progressAmount - The amount of progress to apply to the task.
	 * @returns A promise that resolves to `true` if the operation is successful.
	 * @throws Will cancel the transaction and throw if database action fail.
	 */
	async progressTask(playerId: string, progressAmount: number) {
		const session = await this.model.db.startSession();
		await session.startTransaction();

		const [res, error] = await this.updateTask(playerId, progressAmount);
		if (error) await cancelTransaction(session, error);

		const [status, task] = res;

		if (status === "completed") {
			try {
				await this.playerRewarder.rewardForPlayerTask(playerId, task.points);
			} catch (error) {
				await cancelTransaction(session, error as ServiceError[]);
			}

			const [, deleteError] = await this.basicService.deleteOneById(
				task._id.toString()
			);
			if (deleteError) await cancelTransaction(session, error);
		}

		await session.commitTransaction();
		await session.endSession();

		return true;
	}
}
