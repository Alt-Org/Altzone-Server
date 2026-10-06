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
export enum ServerTaskName {
  // Server tasks 2026

  BANISH_THE_EARWORM = 'banish_the_earworm',

  // Server task: finish / participate in a battle
  GO_TO_BATTLE = 'go_to_battle',

  STRONGER_SOLDIER = 'stronger_soldier',

  FORM_AN_INNER_CONNECTION = 'form_an_inner_connection',

  PLAY_WITH_EMOTIONS = 'play_with_emotions',

  YOUR_VOICE = 'your_voice',

  LETTING_GO_OF_THE_OLD = 'letting_go_of_the_old',

  RECYCLING_EXPERIENCES = 'recycling_experiences',

  INNER_VOICE = 'inner_voice',

  INNER_DISCUSSION = 'inner_discussion',

  BUILD_YOUR_WORLD = 'build_your_world',

  SET_BOUNDARIES = 'set_boundaries',
}
