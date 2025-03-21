/**
 * Enum with events happen during the game
 */
export enum GameEventType {
    /**
     * Triggered when a player wins a battle.
     */
    PLAYER_WIN_BATTLE = "player_win_battle",

    /**
     * Triggered when a player plays the game
     */
    PLAYER_PLAY_BATTLE = "player_play_battle",

    /**
     * Triggered when a player sends a message, such as in chat
     */
    PLAYER_SEND_MESSAGE = "player_send_message",

    /**
     * Triggered when a player casts a vote in decision-making scenarios.
     */
    PLAYER_VOTE = "player_vote",

    /**
     * Triggered when a player initiates a voting event, starting a voting process.
     */
    PLAYER_START_VOTING = "player_start_voting",

    /**
     * Triggered when a player collects diamonds.
     */
    PLAYER_COLLECT_DIAMONDS = "player_collect_diamonds",

    /**
     * Triggered when a player starts a battle using a new character.
     */
    PLAYER_START_BATTLE_NEW_CHARACTER = "player_start_battle_new_character",

    /**
     * Triggered when a player completes a daily task, which is registered by UI.
     * For example when the daily task is to press some button in the game.
     */
    PLAYER_COMPLETE_UI_DAILY_TASK = "player_complete_ui_daily_task"
}
