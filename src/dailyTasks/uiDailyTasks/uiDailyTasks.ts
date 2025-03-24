import { UITaskName } from '../enum/uiTaskName.enum';
import { TaskTitle } from '../type/taskTitle.type';

/**
 * UI daily task basic information
 */
export type UIDailyTaskData = {
  title: TaskTitle;
  type: UITaskName;
  points: number;
  coins: number;
  amount: number;
  timeLimitMinutes: number;
};

/**
 * Record with basic information about each UI managed daily task
 */
export const uiDailyTasks: Record<UITaskName, UIDailyTaskData> = {
  [UITaskName.FIND_3_IMPORTANT_BUTTONS]: {
    title: {
      fi: 'etsi käyttöliittymän kannalta mielestäsi 3 tärkeintä painiketta',
    },
    type: UITaskName.FIND_3_IMPORTANT_BUTTONS,
    points: 10,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },
  [UITaskName.EXPLODE_CHARACTER_BATTLE]: {
    title: { fi: 'räjäytä hahmosi ryöstössä' },
    type: UITaskName.EXPLODE_CHARACTER_BATTLE,
    points: 10,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },
  [UITaskName.WHAT_IS_MISSING]: {
    title: { fi: 'Mitä puuttuu?' },
    type: UITaskName.WHAT_IS_MISSING,
    points: 10,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },
  [UITaskName.FIND_BUG]: {
    title: { fi: 'Etsi bugi!' },
    type: UITaskName.FIND_BUG,
    points: 10,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },
  [UITaskName.FIND_ALL_INSTRUCTION_WINDOWS]: {
    title: { fi: 'löydä kaikki pelin ohjeistusikkunat ja paina niitä' },
    type: UITaskName.FIND_ALL_INSTRUCTION_WINDOWS,
    points: 10,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },
  [UITaskName.FIND_VARIABLE_VALUE_IN_GAME]: {
    title: { fi: 'Löydä muuttuja toiminnassa!' },
    type: UITaskName.FIND_VARIABLE_VALUE_IN_GAME,
    points: 10,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },
  [UITaskName.MAKE_MUSIC_WITH_BUTTONS]: {
    title: { fi: 'tee näppäimillä musiikkia' },
    type: UITaskName.MAKE_MUSIC_WITH_BUTTONS,
    points: 10,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },
  [UITaskName.INFLUENCE_OPPONENT_GAME_CHAT_EMOJI]: {
    title: { fi: 'vaikuta vastustajan peliin viestimällä emojeita' },
    type: UITaskName.INFLUENCE_OPPONENT_GAME_CHAT_EMOJI,
    points: 10,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },
  [UITaskName.PRESS_3_SYMBOL_FURNITURE]: {
    title: { fi: 'paina kolmea symboliikkaa sisältävää huonekalua' },
    type: UITaskName.PRESS_3_SYMBOL_FURNITURE,
    points: 10,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },
  [UITaskName.PRESS_STORY_MOST_IMPRESSIVE_PANELS]: {
    title: {
      fi: 'TUNNETEHTÄVÄ > klikkaa alkutarinasta sinusta vaikuttavinta ruutua',
    },
    type: UITaskName.PRESS_STORY_MOST_IMPRESSIVE_PANELS,
    points: 10,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },
  [UITaskName.WHERE_GAME_HAPPENS]: {
    title: { fi: 'missä peli tarinan mukaan tapahtuu?' },
    type: UITaskName.WHERE_GAME_HAPPENS,
    points: 10,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },
  [UITaskName.PRESS_STORY_TELLING_INSTRUCTIONS]: {
    title: { fi: 'klikkaa tarinaa kertovia ohjeistuksia' },
    type: UITaskName.PRESS_STORY_TELLING_INSTRUCTIONS,
    points: 10,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },

  [UITaskName.PRESS_CHARACTER_DESCRIPTION]: {
    title: { fi: 'lue ja paina pelihahmon kuvausta' },
    type: UITaskName.PRESS_CHARACTER_DESCRIPTION,
    points: 10,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },
  [UITaskName.RECOGNIZE_CHARACTER_MECHANIC]: {
    title: { fi: 'tunnista pelihahmon tarinallinen mekaniikka' },
    type: UITaskName.RECOGNIZE_CHARACTER_MECHANIC,
    points: 10,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },
  [UITaskName.CONTINUE_CLAN_STORY]: {
    title: { fi: 'jatka klaanin tarinaa' },
    type: UITaskName.CONTINUE_CLAN_STORY,
    points: 10,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },
  [UITaskName.RECOGNIZE_GRAPHIC_HINTS]: {
    title: { fi: 'tunnista graafiset vihjeet' },
    type: UITaskName.RECOGNIZE_GRAPHIC_HINTS,
    points: 10,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },
  [UITaskName.RECOGNIZE_AUDIO_HINTS]: {
    title: { fi: 'tunnista äänimaailman vihjeet' },
    type: UITaskName.RECOGNIZE_AUDIO_HINTS,
    points: 10,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },
  [UITaskName.WRITE_BATTLE_DIALOG]: {
    title: { fi: 'kirjoita battlen dialogi' },
    type: UITaskName.WRITE_BATTLE_DIALOG,
    points: 10,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },
  [UITaskName.FIND_UI_SYMBOLIC_GRAPHICS]: {
    title: { fi: 'löydä käyttöliittymästä symbolista grafiikkaa' },
    type: UITaskName.FIND_UI_SYMBOLIC_GRAPHICS,
    points: 10,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },
  [UITaskName.CHOOSE_FAVORITE_INTERIOR_SERIES]: {
    title: { fi: 'valitse lemppari sisustus-sarjasi' },
    type: UITaskName.CHOOSE_FAVORITE_INTERIOR_SERIES,
    points: 10,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },
  [UITaskName.PRESS_YOURSELF_IDENTIFYING_STORIES]: {
    title: { fi: 'klikkaa tarinoita joihin pystyt samastumaan' },
    type: UITaskName.PRESS_YOURSELF_IDENTIFYING_STORIES,
    points: 10,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },

  [UITaskName.WHAT_IS_GAME_STORY]: {
    title: { fi: 'mikä on pelin viesti? mistä peli kertoo?' },
    type: UITaskName.WHAT_IS_GAME_STORY,
    points: 10,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },
  [UITaskName.PRESS_STORY_EXPANDING_OBJECTS]: {
    title: {
      fi: 'etsi ja klikkaa pelin tarinaa laajentavia asioita nettisivuilta',
    },
    type: UITaskName.PRESS_STORY_EXPANDING_OBJECTS,
    points: 10,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },
  [UITaskName.PRESS_FAMOUS_THINGS_REFERRING_OBJECTS]: {
    title: {
      fi: 'klikkaa tunnettuihin teoksiin, ideoihin tai ihmisiin viittaavia asioita',
    },
    type: UITaskName.PRESS_FAMOUS_THINGS_REFERRING_OBJECTS,
    points: 10,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },
  [UITaskName.PRESS_OTHER_GRAPHIC_STYLE_ELEMENTS]: {
    title: {
      fi: 'etsi ja klikkaa graafisia elementtejä, jotka viittaavat muihin taiteenlajeihin',
    },
    type: UITaskName.PRESS_OTHER_GRAPHIC_STYLE_ELEMENTS,
    points: 10,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },
  [UITaskName.WHAT_STYLE_TYPES_GAME_HAS]: {
    title: { fi: 'mitä lajityyppiä (tai useampaa) peli sinulle edustaa?' },
    type: UITaskName.WHAT_STYLE_TYPES_GAME_HAS,
    points: 10,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },
  [UITaskName.PRESS_FAMOUS_CHARACTER]: {
    title: { fi: 'klikkaa pelihahmoa josta tulee mieleen joku tunnettu hahmo' },
    type: UITaskName.PRESS_FAMOUS_CHARACTER,
    points: 10,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },
  [UITaskName.WHAT_FAMOUS_GAME_REMINDING]: {
    title: { fi: 'mitä tunnettua peliä tämä peli muistuttaa?' },
    type: UITaskName.WHAT_FAMOUS_GAME_REMINDING,
    points: 10,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },
  [UITaskName.CHOOSE_CULTURAL_GUIDELINE_CLAN_DESCRIPTION]: {
    title: { fi: 'valitse klaanin kuvaukseen toimintakulttuurinen ohje' },
    type: UITaskName.CHOOSE_CULTURAL_GUIDELINE_CLAN_DESCRIPTION,
    points: 10,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },
  [UITaskName.CHANGE_LANGUAGE]: {
    title: {
      fi: 'katso kieliasetukset ja klikkaa kohtia jotka muuttuvat eri kielien välillä',
    },
    type: UITaskName.CHANGE_LANGUAGE,
    points: 10,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },
  [UITaskName.PRESS_MONEY_STUFF]: {
    title: { fi: 'klikkaa asioita, joissa voi käyttää rahaa' },
    type: UITaskName.PRESS_MONEY_STUFF,
    points: 10,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },

  [UITaskName.USE_ONLY_POSITIVE_GESTURES_IN_BATTLE]: {
    title: {
      fi: 'käytä matsin aikana vain positiivisia ja kannustavia eleitä',
    },
    type: UITaskName.USE_ONLY_POSITIVE_GESTURES_IN_BATTLE,
    points: 10,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },
  [UITaskName.USE_ONLY_NEGATIVE_GESTURES_IN_BATTLE]: {
    title: { fi: 'käytä matsin aikana vain negatiivisia eleitä' },
    type: UITaskName.USE_ONLY_NEGATIVE_GESTURES_IN_BATTLE,
    points: 10,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },
  [UITaskName.PRESS_PRIZE_GIVING_ITEMS]: {
    title: {
      fi: 'tunnista ja paina kohtia, joissa peli palkitsee sinua jotenkin',
    },
    type: UITaskName.PRESS_PRIZE_GIVING_ITEMS,
    points: 10,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },
  [UITaskName.PRESS_ACCESSIBILITY_SETTINGS]: {
    title: { fi: 'etsi ja klikkaa kaikkia saavutettavuus-asetuksia' },
    type: UITaskName.PRESS_ACCESSIBILITY_SETTINGS,
    points: 10,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },
  [UITaskName.PRESS_ETHIC_QUESTIONABLE_OBJECTS]: {
    title: { fi: 'etsi ja klikkaa eettisesti arveluttavia asioita' },
    type: UITaskName.PRESS_ETHIC_QUESTIONABLE_OBJECTS,
    points: 10,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },
  [UITaskName.PRESS_RESPONSIBILITY_OBJECTS]: {
    title: { fi: 'etsi ja klikkaa vastuullisuuteen liittyviä asioita' },
    type: UITaskName.PRESS_RESPONSIBILITY_OBJECTS,
    points: 10,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },
  [UITaskName.PRESS_SUSTAINABLE_CONSUMPTION_OBJECTS]: {
    title: { fi: 'etsi ja klikkaa kestävään kuluttamiseen liittyviä asioita' },
    type: UITaskName.PRESS_SUSTAINABLE_CONSUMPTION_OBJECTS,
    points: 10,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },
  [UITaskName.PRESS_VALUES_OBJECTS]: {
    title: { fi: 'etsi ja klikkaa arvoihin liittyviä asioita' },
    type: UITaskName.PRESS_VALUES_OBJECTS,
    points: 10,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },
};
