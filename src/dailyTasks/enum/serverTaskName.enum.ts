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
  // Server tasks 10/2026

  CHANGE_THE_MUSIC = 'change_the_music', // was BANISH_THE_EARWORM

  PLAY_A_BATTLE = 'play_a_battle', // was GO_TO_BATTLE

  UPGRADE_A_DEFENCE_SOLDIER = 'upgrade_a_defence_soldier', // was STRONGER_SOLDIER

  MESSAGE_YOUR_CLAN = 'message_your_clan', // was FORM_AN_INNER_CONNECTION

  SPECTRUM_OF_EMOTIONS = 'spectrum_of_emotions', // was PLAY_WITH_EMOTIONS

  CAST_YOUR_VOTE = 'cast_your_vote', // was YOUR_VOICE

  PROPOSE_AN_ITEM_SALE = 'propose_an_item_sale', // was LETTING_GO_OF_THE_OLD

  LIST_AN_ITEM_FOR_SALE = 'list_an_item_for_sale', // was RECYCLING_EXPERIENCES

  UPDATE_CLAN_MOTTO = 'update_clan_motto', // was INNER_VOICE

  START_A_VOTE = 'start_a_vote', // was INNER_DISCUSSION

  FURNISH_WITH_ONE_COLLECTION = 'furnish_with_one_collection', // was BUILD_YOUR_WORLD

  PROPOSE_A_RULE_CHANGE = 'propose_a_rule_change', // was SET_BOUNDARIES
}
