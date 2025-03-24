/**
 * Enum containing daily tasks monitored by the client side
 */
export enum UITaskName {
  //Client, what are these buttons? Is find = click?
  /**
   * etsi käyttöliittymän kannalta mielestäsi 3 tärkeintä painiketta
   */
  FIND_3_IMPORTANT_BUTTONS = 'find_3_important_buttons',
  //Client
  /**
   * räjäytä hahmosi ryöstössä
   */
  EXPLODE_CHARACTER_BATTLE = 'explode_character_battle',

  //Client, how to implement and what is that thing?
  /**
   * "Mitä puuttuu?"
   */
  WHAT_IS_MISSING = 'what_is_missing',
  //Client, how to implement and what is that thing?
  /**
   * "Etsi bugi!"
   */
  FIND_BUG = 'find_bug',

  //Client, what is the list of these windows, what does find means
  /**
   * löydä kaikki pelin ohjeistusikkunat ja paina niitä
   */
  FIND_ALL_INSTRUCTION_WINDOWS = 'find_all_instruction_windows',

  //Client, How to implement, is it some answer question task?
  /**
   * "Löydä muuttuja toiminnassa!"
   */
  FIND_VARIABLE_VALUE_IN_GAME = 'find_variable_value_in_game',

  //Client
  /**
   * tee näppäimillä musiikkia
   */
  MAKE_MUSIC_WITH_BUTTONS = 'make_music_with_buttons',

  //Client, What is that, how to measure and how to implement?
  /**
   * vaikuta vastustajan peliin viestimällä emojeita
   */
  INFLUENCE_OPPONENT_GAME_CHAT_EMOJI = 'influence_opponent_game_chat_chat_emoji',

  //Client, what the symbols are, are there a specific symbol furniture
  /**
   * paina kolmea symboliikkaa sisältävää huonekalua
   */
  PRESS_3_SYMBOL_FURNITURE = 'press_3_symbol_furniture',

  //Client, is it defined?
  /**
   * TUNNETEHTÄVÄ > klikkaa alkutarinasta sinusta vaikuttavinta ruutua
   */
  PRESS_STORY_MOST_IMPRESSIVE_PANELS = 'press_story_impressive_panels',

  //Client, how, via a form?
  /**
   * missä peli tarinan mukaan tapahtuu?
   */
  WHERE_GAME_HAPPENS = 'where_game_happens',

  //Client, what they are + how much to press?
  /**
   * klikkaa tarinaa kertovia ohjeistuksia
   */
  PRESS_STORY_TELLING_INSTRUCTIONS = 'press_story_testing_instructions',

  //Client, is it defined? where to press?
  /**
   * lue ja paina pelihahmon kuvausta
   */
  PRESS_CHARACTER_DESCRIPTION = 'press_character_description',

  //Client, how, via form? What is the answer?
  /**
   * tunnista pelihahmon tarinallinen mekaniikka
   */
  RECOGNIZE_CHARACTER_MECHANIC = 'recognize_character_mechanic',

  //Client, how + what does it mean?
  /**
   * jatka klaanin tarinaa
   */
  CONTINUE_CLAN_STORY = 'continue_clan_story',

  //Client, how, via form, what are they?
  /**
   * tunnista graafiset vihjeet
   */
  RECOGNIZE_GRAPHIC_HINTS = 'recognize_graphic_hints',

  //Client, how, via form, what are they?
  /**
   * tunnista äänimaailman vihjeet
   */
  RECOGNIZE_AUDIO_HINTS = 'recognize_audio_hints',

  //Client or Server, depends on what that means?
  /**
   * kirjoita battlen dialogi
   */
  WRITE_BATTLE_DIALOG = 'write_battle_dialog',

  //Client, what is that symbolic + how to implement, via a form?
  /**
   * löydä käyttöliittymästä symbolista grafiikkaa
   */
  FIND_UI_SYMBOLIC_GRAPHICS = 'find_ui_symbolics',

  //Client, how via a form?
  /**
   * valitse lemppari sisustus-sarjasi
   */
  CHOOSE_FAVORITE_INTERIOR_SERIES = 'choose_favorite_interior_series',

  //Client, how, via a form?
  /**
   * klikkaa tarinoita joihin pystyt samastumaan
   */
  PRESS_YOURSELF_IDENTIFYING_STORIES = 'press_yourself_identifying_stories',

  //Client, how, via a form?
  /**
   * mikä on pelin viesti? mistä peli kertoo?
   */
  WHAT_IS_GAME_STORY = 'what_is_game_story',

  //Client, what they are?
  /**
   * etsi ja klikkaa pelin tarinaa laajentavia asioita nettisivuilta
   */
  PRESS_STORY_EXPANDING_OBJECTS = 'press_story_expanding_objects',

  //Client, what are these objects, where they are present? How much?
  /**
   * klikkaa tunnettuihin teoksiin, ideoihin tai ihmisiin viittaavia asioita
   */
  PRESS_FAMOUS_THINGS_REFERRING_OBJECTS = 'press_famous_thing_referring_objects',

  //Client, where game or web pages? What are these elements? How much to press?
  /**
   * etsi ja klikkaa graafisia elementtejä, jotka viittaavat muihin taiteenlajeihin
   */
  PRESS_OTHER_GRAPHIC_STYLE_ELEMENTS = 'press_other_graphic_style_elements',

  //Client, via form, what they are?
  /**
   * mitä lajityyppiä (tai useampaa) peli sinulle edustaa?
   */
  WHAT_STYLE_TYPES_GAME_HAS = 'what_style_types_game_has',

  //Client, via form? What is the answer?
  /**
   * klikkaa pelihahmoa josta tulee mieleen joku tunnettu hahmo
   */
  PRESS_FAMOUS_CHARACTER = 'press_famous_character',

  //Client, via form? What is the answer
  /**
   * mitä tunnettua peliä tämä peli muistuttaa?
   */
  WHAT_FAMOUS_GAME_REMINDING = 'what_famous_game_reminding',

  //Client
  /**
   * valitse klaanin kuvaukseen toimintakulttuurinen ohje
   */
  CHOOSE_CULTURAL_GUIDELINE_CLAN_DESCRIPTION = 'choose_cultural_guideline_cultural_description',

  //Client
  /**
   * katso kieliasetukset ja klikkaa kohtia jotka muuttuvat eri kielien välillä
   */
  CHANGE_LANGUAGE = 'change_language',

  //Client, what money, real? what are these things?
  /**
   * klikkaa asioita, joissa voi käyttää rahaa
   */
  PRESS_MONEY_STUFF = 'press_money_stuff',

  //Client, what are these gestures, how to use them?
  /**
   * käytä matsin aikana vain positiivisia ja kannustavia eleitä
   */
  USE_ONLY_POSITIVE_GESTURES_IN_BATTLE = 'use_only_positive_gestures_in_battle',
  /**
   * käytä matsin aikana vain negatiivisia eleitä
   */
  USE_ONLY_NEGATIVE_GESTURES_IN_BATTLE = 'use_only_negative_gestures_in_battle',

  //Client, What are these?
  /**
   * tunnista ja paina kohtia, joissa peli palkitsee sinua jotenkin
   */
  PRESS_PRIZE_GIVING_ITEMS = 'press_prize_giving_items',

  //Client, what are these?
  /**
   * etsi ja klikkaa kaikkia saavutettavuus-asetuksia
   */
  PRESS_ACCESSIBILITY_SETTINGS = 'press_accessibility_settings',

  //Client, what are these?
  /**
   * etsi ja klikkaa eettisesti arveluttavia asioita
   */
  PRESS_ETHIC_QUESTIONABLE_OBJECTS = 'press_ethic_questionable_objects',

  //Client, what are these? Responsibility for what + where to press?
  /**
   * etsi ja klikkaa vastuullisuuteen liittyviä asioita
   */
  PRESS_RESPONSIBILITY_OBJECTS = 'press_responsibility_objects',

  //Client, what and where?
  /**
   * etsi ja klikkaa kestävään kuluttamiseen liittyviä asioita
   */
  PRESS_SUSTAINABLE_CONSUMPTION_OBJECTS = 'press_substainable_consumption_objects',

  //Client, what and where?
  /**
   * etsi ja klikkaa arvoihin liittyviä asioita
   */
  PRESS_VALUES_OBJECTS = 'press_values_objects',
}
