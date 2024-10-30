import { TaskName } from "../../playerTasks/enum/taskName.enum"

export type Reward = { points: number, coins: number }

export const points: Record<TaskName, Reward> = {
	[TaskName.PLAY_BATTLE]: {
		points: 0,
		coins: 0
	},
	[TaskName.START_VOTING]: {
		points: 0,
		coins: 0
	},
	[TaskName.COLLECT_DIAMONDS]: {
		points: 0,
		coins: 0
	},
	[TaskName.WIN_BATTLE]: {
		points: 0,
		coins: 0
	},
	[TaskName.WRITE_CHAT_MESSAGE]: {
		points: 0,
		coins: 0
	},
	[TaskName.START_BATTLE_NEW_CHARACTER]: {
		points: 0,
		coins: 0
	},
	[TaskName.VOTE]: {
		points: 0,
		coins: 0
	}
}
