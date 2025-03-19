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
    WRITE_CHAT_MESSAGE = "write_chat_message",

    //Why?
    /**
     * lataa peli (tää tehtävä on jo valmis ja pitää vaan klikata valmiiksi klaanissa)
     */
    DOWNLOAD_GAME = "download_game",

    //Server, what is the song, name of the soundtrack?
    /**
     * vaihda biisi sielunkodissa
     */
    CHANGE_SONG_SOULHOME = "change_song_soulhome",

    //Server, what is it, list of soundtrack names?
    /**
     * luo soittolista klaanille
     */
    CREATE_CLAN_PLAYLIST = "create_clan_playlist",

    //Server, what is that?
    /**
     * laita esine toisen sisään sielunkodissa
     */
    PUT_ITEM_INSIDE_ANOTHER_ITEM_SOULHOME = "put_item_inside_another_item_soulhome",

    //Server, to any?
    /**
     * vaihda avatarisi vaatteita
     */
    CHANGE_AVATAR_CLOTHES = "change_avatar_clothes",
    //Server, to any?
    /**
     * muokkaa hahmosi statseja
     */
    CHANGE_CHARACTER_STATS = "change_character_stats",

    //Server
    /**
     * pelaa battle
     */
    PLAY_BATTLE = "play_battle",
    //Server
    /**
     * voita battle
     */
    WIN_BATTLE = "win_battle",

    //Server
    /**
     * onnistu ryöstössä
     */
    SUCCEED_STEAL = "succeed_steal",

    //Server, how much is too much?
    /**
     * ryöstä liikaa tavaraa
     */
    STEAL_TOO_MUCH = "steal_too_much",

    //Server + what does each mean?
    /**
     * muokkaa pelihahmosta nopea
     */
    CHANGE_CHARACTER_BE_FAST = "change_character_be_fast",
    /**
     * muokkaa pelihahmosta kestävä (HP)
     */
    CHANGE_CHARACTER_BE_RESISTANT = "change_character_be_resistant",
    /**
     * muokkaa pelihahmosta voimakas
     */
    CHANGE_CHARACTER_BE_STRONG = "change_character_be_strong",
    /**
     * muokkaa pelihahmosta isokokoinen
     */
    CHANGE_CHARACTER_BE_LARGE = "change_character_be_large",

    //Server or client, depends on what does it mean? mb not implement if too complicated
    /**
     * käytä kaikki sielunkotisi esineet
     */
    USE_ALL_ITEMS_SOULHOME = "use_all_items_soulhome",

    //Server + is "asento" = place / coordinates? and what does items mean, is it 2 or more or all of them?
    /**
     * vaihda sielunkodin esineiden asentoja
     */
    CHANGE_ITEMS_POSITION = "change_items_position",

    //What is that?
    /**
     * luo pelistrategia
     */
    CREATE_GAME_STRATEGY = "create_game_strategy",

    //Server
    /**
     * laita viesti klaanissa
     */
    WRITE_CHAT_MESSAGE_CLAN = "write_chat_message",
    /**
     * laita privaviesti toiselle pelaajalle
     */
    WRITE_CHAT_MESSAGE_PRIVATE = "write_chat_message_private",

    //How?
    /**
     * löydä kaikki chat-vaihtoehdot
     */
    FIND_ALL_CHAT_OPTIONS = "find_all_chat_options",

    //Server
    /**
     * käytä kaikkia eri tunne-emojeita
     */
    USE_ALL_CHAT_FEELINGS = "use_all_chat_feelings",

    //How, in chat and is it emoji or feeling?
    /**
     * reagoi emojilla matsissa
     */
    REACT_EMOJI_BATTLE = "react_emoji_battle",

    //Server, is it = put item to sell to flea market?
    /**
     * laita tavaraa klaanissa myyntiin
     */
    SELL_CLAN_ITEM = "sell_clan_item",

    //Server
    /**
     * osallistu klaanin äänestykseen
     */
    PARTICIPATE_CLAN_VOTING = "participate_clan_voting",
    /**
     * luo uusi äänestys klaaniin
     */
    CREATE_CLAN_VOTING = "create_clan_voting",

    //Server, what is the difference from SELL_CLAN_ITEM?
    /**
     * lisää tavara kirpputorille
     */
    ADD_ITEM_TO_FLEA_MARKET = "add_item_to_flea_market",

    //Server, to own player + what is that?
    /**
     * kirjoita esittelytekstisi pelaajaprofiiliin
     */
    WRITE_PLAYER_INTRO_TEXT = "write_player_intro_text",

    //Server, what is that?
    /**
     * määrittele pelaajatyylisi pelaajaprofiiliin
     */
    DEFINE_PLAYER_STYLE = "define_player_style",

    //Server, any change of data?
    /**
     * muokkaa avatarisi ulkonäköä
     */
    CHANGE_AVATAR_OUTLOOK = "change_avatar_outlook",

    //Server, what is the slogan and how is it different from intro text
    /**
     * määrittele "iskulauseesi"
     */
    DEFINE_PLAYER_SLOGAN = "define_player_slogan",

    //Server, is it feeling or emoji?
    /**
     * reagoi emojilla toisen viestiin
     */
    REACT_EMOJI_CHAT = "react_emoji_chat",

    //Server, what is a clan friend + how he/she is called?
    /**
     * kutsu klaanikaveri battleen
     */
    CALL_CLAN_TO_FRIEND_BATTLE = "call_clan_friend_to_battle",

    //Server, what is a friend, add where?
    /**
     * lisää kaveri
     */
    ADD_FRIEND = "add_friend",

    //Server, what and why, requires a lot of work, is it worth it?
    /**
     * jaa battle-replay klaani chattiin
     */
    SHARE_BATTLE_REPLAY_CLAN_CHAT = "share_battle_replay_clan_chat",

    //How to implement? One such implementation is to ask a question that can be answered only after joining a server.
    // like if the discord server is closed and the question is "what is the name of main channel?"
    /**
     * liity pelin discordiin
     */
    JOIN_GAME_DISCORD = "join_game_discord",

    //Where? Same questions as with SHARE_BATTLE_REPLAY_CLAN_CHAT
    /**
     * katso klaanilaisen replay-video
     */
    WATCH_REPLAY_VIDEO = "watch_reply_video",

    //Where? Same as with SHARE_BATTLE_REPLAY_CLAN_CHAT
    /**
     * jaa matsin replay-video
     */
    SHARE_REPLAY_VIDEO = "share_reply_video",

    //Server, how to measure?
    /**
     * valitse pelihahmo, joka heijastaa parhaiten pelaajatyyliäsi
     */
    CHOOSE_CHARACTER_OF_YOUR_STYLE = "choose_character_of_your_style",

    //Server, how to measure + where is the interior?
    /**
     * tee yhtenäinen sisustus
     */
    CREATE_UNIFIED_INTERIOR = "create_unified_interior",

    //What is that?
    /**
     * katso replay ja klikkaa sopivaa tunnereaktiota eri kohdissa
     */
    WATCH_REPLAY_REACT_FEELING = "watch_reply_react_feeling",

    //What is player type, where is it defined. How is it different from player style
    /**
     * määrittele pelaajaprofiiliin pelaajatyyppisi
     */
    DEFINE_PLAYER_TYPE = "define_player_type",
}
