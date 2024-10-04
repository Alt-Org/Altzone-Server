/**
 * Enum used to represent the different types of tasks in the application.
 *
 * This enum is used in various parts of the application, such as:
 * - When defining tasks in the JSON configuration file
 * - When processing tasks in the service layer
 * - When returning task data to the client side
 *
 * Notice that whenever there is a need to add a new task type, this enum must be updated with the new task name.
 *
 * Notice that whenever there is a need to specify a task type, this enum must be used instead of plain text.
 * @example ```ts
 * // Do not write it as plain text
 * const taskType = 'play_battle';
 * // Use the enum instead
 * const taskType = TaskName.PLAY_BATTLE;
 * ```
 */
export enum TaskName {
	PLAY_BATTLE = "play_battle",
	START_VOTING = "start_voting",
	COLLECT_DIAMONDS = "collect_diamonds_in_battle",
	WIN_BATTLE = "win_battle",
	WRITE_CHAT_MESSAGE = "write_chat_message",
	START_BATTLE_NEW_CHARACTER = "start_battle_with_new_character",
	VOTE = "vote",
}