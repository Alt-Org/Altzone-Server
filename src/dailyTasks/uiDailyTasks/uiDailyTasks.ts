import { UITaskName } from '../enum/uiTaskName.enum';
import { TaskTitle } from '../type/taskTitle.type';
import { Score } from '../../common/values/scoring.values';

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
  [UITaskName.FIND_THE_ERROR]: {
    title: {
      fi: 'etsi sisäinen toimintahäiriö',
    },
    type: UITaskName.FIND_THE_ERROR,
    points: Score.DAILY_TASK.COMPLETED,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },
  [UITaskName.PLAY_MELODY]: {
    title: {
      fi: 'soita_sävelmä',
    },
    type: UITaskName.PLAY_MELODY,
    points: Score.DAILY_TASK.COMPLETED,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },
  [UITaskName.CHOOSE_YOUR_TRUTH]: {
    title: {
      fi: 'valitse prologin näkymä, joka herättää eniten tunnistettavan tunteen',
    },
    type: UITaskName.CHOOSE_YOUR_TRUTH,
    points: Score.DAILY_TASK.COMPLETED,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },
  [UITaskName.HOLD_THE_CHARACTER]: {
    title: {
      fi: 'pysähdy defenssisoturin äärelle ja kuuntele sen taustaa',
    },
    type: UITaskName.HOLD_THE_CHARACTER,
    points: Score.DAILY_TASK.COMPLETED,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },
  [UITaskName.WHERE_ARE_YOU]: {
    title: {
      fi: 'tunnista tila jossa sisäinen tapahtuma tapahtuu',
    },
    type: UITaskName.WHERE_ARE_YOU,
    points: Score.DAILY_TASK.COMPLETED,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },
  [UITaskName.FOLLOW_THE_VOICE]: {
    title: {
      fi: 'etsi ohjeet jotka oikeasti ohjaavat toimintaasi',
    },
    type: UITaskName.FOLLOW_THE_VOICE,
    points: Score.DAILY_TASK.COMPLETED,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },
  [UITaskName.BUILD_YOUR_WORLD]: {
    title: { fi: 'muodosta turvapaikkaan yhtenäinen kokemus yhdestä teemasta' },
    type: UITaskName.BUILD_YOUR_WORLD,
    points: Score.DAILY_TASK.COMPLETED,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },
  [UITaskName.READ_THE_SIGNS]: {
    title: { fi: 'etsi symboli joka ei selitä itseään vaan ehdottaa' },
    type: UITaskName.READ_THE_SIGNS,
    points: Score.DAILY_TASK.COMPLETED,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },
  [UITaskName.FIND_THE_ROOTS]: {
    title: { fi: 'löydä osa, jossa toisen vaikutus on muokannut sinua' },
    type: UITaskName.FIND_THE_ROOTS,
    points: Score.DAILY_TASK.COMPLETED,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },
  [UITaskName.LOOK_INSIDE]: {
    title: { fi: 'tunnista millainen rakenne sinua ohjaa' },
    type: UITaskName.LOOK_INSIDE,
    points: Score.DAILY_TASK.COMPLETED,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },
  [UITaskName.SET_BOUNDARIES]: {
    title: { fi: 'valitse sisäiset periaatteesi' },
    type: UITaskName.LOOK_INSIDE,
    points: Score.DAILY_TASK.COMPLETED,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },
  [UITaskName.USE_OF_POWER]: {
    title: {
      fi: 'missä käyt sisäisen valtataistelusi tai punnitset eri vaihtoehtoja?',
    },
    type: UITaskName.USE_OF_POWER,
    points: Score.DAILY_TASK.COMPLETED,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },
  [UITaskName.COMMON_FACTOR]: {
    title: {
      fi: 'mitä olet oppinut joltain toiselta? etsi teitä yhdistävä asia',
    },
    type: UITaskName.COMMON_FACTOR,
    points: Score.DAILY_TASK.COMPLETED,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },
  [UITaskName.SPIRITUAL_CURRENCY]: {
    title: { fi: 'etsi pelistä henkisenvaluutan symboli' },
    type: UITaskName.SPIRITUAL_CURRENCY,
    points: Score.DAILY_TASK.COMPLETED,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },
  [UITaskName.REWARD_TRAPS]: {
    title: { fi: 'tunnista, missä syntyy dopamiinia ja onnistumisen tunnetta' },
    type: UITaskName.REWARD_TRAPS,
    points: Score.DAILY_TASK.COMPLETED,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },
  [UITaskName.MORAL_DILEMMAS]: {
    title: {
      fi: 'etsi kohta, jossa jouduit pohtimaan oikean ja väärän merkitystä',
    },
    type: UITaskName.MORAL_DILEMMAS,
    points: Score.DAILY_TASK.COMPLETED,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },
  [UITaskName.ECO_FRIENDLY]: {
    title: { fi: 'huomaa miten toimintasi jättää jäljen tähän maailmaan' },
    type: UITaskName.ECO_FRIENDLY,
    points: Score.DAILY_TASK.COMPLETED,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },
  [UITaskName.HUNTING_FOR_VALUES]: {
    title: { fi: 'miten ohjenuorasi rakentuu. minkälaisia arvoja edustat?' },
    type: UITaskName.HUNTING_FOR_VALUES,
    points: Score.DAILY_TASK.COMPLETED,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },
  [UITaskName.ETHICS_METRICS]: {
    title: { fi: 'kumpi soturisi kulkee parempaa polkua?' },
    type: UITaskName.ETHICS_METRICS,
    points: Score.DAILY_TASK.COMPLETED,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },
  // here begin the old UI daily tasks
  /*  [UITaskName.FIND_3_IMPORTANT_BUTTONS]: {
    title: {
      fi: 'etsi käyttöliittymän kannalta mielestäsi 3 tärkeintä painiketta',
    },
    type: UITaskName.FIND_3_IMPORTANT_BUTTONS,
    points: Score.DAILY_TASK.COMPLETED,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },*/
  /* [UITaskName.EXPLODE_CHARACTER_BATTLE]: {
    title: { fi: 'räjäytä hahmosi ryöstössä' },
    type: UITaskName.EXPLODE_CHARACTER_BATTLE,
    points: Score.DAILY_TASK.COMPLETED,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },*/
  /*[UITaskName.WHAT_IS_MISSING]: {
    title: { fi: 'Mitä puuttuu?' },
    type: UITaskName.WHAT_IS_MISSING,
    points: Score.DAILY_TASK.COMPLETED,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },*/
  /* [UITaskName.FIND_BUG]: {
    title: { fi: 'Etsi bugi!' },
    type: UITaskName.FIND_BUG,
    points: Score.DAILY_TASK.COMPLETED,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },*/
  /*[UITaskName.FIND_ALL_INSTRUCTION_WINDOWS]: {
    title: { fi: 'löydä kaikki pelin ohjeistusikkunat ja paina niitä' },
    type: UITaskName.FIND_ALL_INSTRUCTION_WINDOWS,
    points: Score.DAILY_TASK.COMPLETED,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },*/
  /* [UITaskName.FIND_VARIABLE_VALUE_IN_GAME]: {
    title: { fi: 'Löydä muuttuja toiminnassa!' },
    type: UITaskName.FIND_VARIABLE_VALUE_IN_GAME,
    points: Score.DAILY_TASK.COMPLETED,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },*/
  /*[UITaskName.MAKE_MUSIC_WITH_BUTTONS]: {
    title: { fi: 'tee näppäimillä musiikkia' },
    type: UITaskName.MAKE_MUSIC_WITH_BUTTONS,
    points: Score.DAILY_TASK.COMPLETED,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },*/
  /*[UITaskName.INFLUENCE_OPPONENT_GAME_CHAT_EMOJI]: {
    title: { fi: 'vaikuta vastustajan peliin viestimällä emojeita' },
    type: UITaskName.INFLUENCE_OPPONENT_GAME_CHAT_EMOJI,
    points: Score.DAILY_TASK.COMPLETED,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },*/
  /*[UITaskName.PRESS_3_SYMBOL_FURNITURE]: {
    title: { fi: 'paina kolmea symboliikkaa sisältävää huonekalua' },
    type: UITaskName.PRESS_3_SYMBOL_FURNITURE,
    points: Score.DAILY_TASK.COMPLETED,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },*/
  /* [UITaskName.PRESS_STORY_MOST_IMPRESSIVE_PANELS]: {
    title: {
      fi: 'TUNNETEHTÄVÄ > klikkaa alkutarinasta sinusta vaikuttavinta ruutua',
    },
    type: UITaskName.PRESS_STORY_MOST_IMPRESSIVE_PANELS,
    points: Score.DAILY_TASK.COMPLETED,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },*/
  /* [UITaskName.WHERE_GAME_HAPPENS]: {
    title: { fi: 'missä peli tarinan mukaan tapahtuu?' },
    type: UITaskName.WHERE_GAME_HAPPENS,
    points: Score.DAILY_TASK.COMPLETED,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },*/
  /* [UITaskName.PRESS_STORY_TELLING_INSTRUCTIONS]: {
    title: { fi: 'klikkaa tarinaa kertovia ohjeistuksia' },
    type: UITaskName.PRESS_STORY_TELLING_INSTRUCTIONS,
    points: Score.DAILY_TASK.COMPLETED,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },*/
  /*
  [UITaskName.PRESS_CHARACTER_DESCRIPTION]: {
    title: { fi: 'lue ja paina pelihahmon kuvausta' },
    type: UITaskName.PRESS_CHARACTER_DESCRIPTION,
    points: Score.DAILY_TASK.COMPLETED,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },*/
  /* [UITaskName.RECOGNIZE_CHARACTER_MECHANIC]: {
    title: { fi: 'tunnista pelihahmon tarinallinen mekaniikka' },
    type: UITaskName.RECOGNIZE_CHARACTER_MECHANIC,
    points: Score.DAILY_TASK.COMPLETED,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },*/
  /*[UITaskName.CONTINUE_CLAN_STORY]: {
    title: { fi: 'jatka klaanin tarinaa' },
    type: UITaskName.CONTINUE_CLAN_STORY,
    points: Score.DAILY_TASK.COMPLETED,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },*/
  /* [UITaskName.RECOGNIZE_GRAPHIC_HINTS]: {
    title: { fi: 'tunnista graafiset vihjeet' },
    type: UITaskName.RECOGNIZE_GRAPHIC_HINTS,
    points: Score.DAILY_TASK.COMPLETED,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },*/
  /*[UITaskName.RECOGNIZE_AUDIO_HINTS]: {
    title: { fi: 'tunnista äänimaailman vihjeet' },
    type: UITaskName.RECOGNIZE_AUDIO_HINTS,
    points: Score.DAILY_TASK.COMPLETED,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },*/
  /* [UITaskName.WRITE_BATTLE_DIALOG]: {
    title: { fi: 'kirjoita battlen dialogi' },
    type: UITaskName.WRITE_BATTLE_DIALOG,
    points: Score.DAILY_TASK.COMPLETED,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },*/
  /*[UITaskName.FIND_UI_SYMBOLIC_GRAPHICS]: {
    title: { fi: 'löydä käyttöliittymästä symbolista grafiikkaa' },
    type: UITaskName.FIND_UI_SYMBOLIC_GRAPHICS,
    points: Score.DAILY_TASK.COMPLETED,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },*/
  /*[UITaskName.CHOOSE_FAVORITE_INTERIOR_SERIES]: {
    title: { fi: 'valitse lemppari sisustus-sarjasi' },
    type: UITaskName.CHOOSE_FAVORITE_INTERIOR_SERIES,
    points: Score.DAILY_TASK.COMPLETED,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },*/
  /*[UITaskName.PRESS_YOURSELF_IDENTIFYING_STORIES]: {
    title: { fi: 'klikkaa tarinoita joihin pystyt samastumaan' },
    type: UITaskName.PRESS_YOURSELF_IDENTIFYING_STORIES,
    points: Score.DAILY_TASK.COMPLETED,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },*/
  /*
  [UITaskName.WHAT_IS_GAME_STORY]: {
    title: { fi: 'mikä on pelin viesti? mistä peli kertoo?' },
    type: UITaskName.WHAT_IS_GAME_STORY,
    points: Score.DAILY_TASK.COMPLETED,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },*/
  /*
  [UITaskName.PRESS_STORY_EXPANDING_OBJECTS]: {
    title: {
      fi: 'etsi ja klikkaa pelin tarinaa laajentavia asioita nettisivuilta',
    },
    type: UITaskName.PRESS_STORY_EXPANDING_OBJECTS,
    points: Score.DAILY_TASK.COMPLETED,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },*/
  /*
  [UITaskName.PRESS_FAMOUS_THINGS_REFERRING_OBJECTS]: {
    title: {
      fi: 'klikkaa tunnettuihin teoksiin, ideoihin tai ihmisiin viittaavia asioita',
    },
    type: UITaskName.PRESS_FAMOUS_THINGS_REFERRING_OBJECTS,
    points: Score.DAILY_TASK.COMPLETED,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },*/
  /*
  [UITaskName.PRESS_OTHER_GRAPHIC_STYLE_ELEMENTS]: {
    title: {
      fi: 'etsi ja klikkaa graafisia elementtejä, jotka viittaavat muihin taiteenlajeihin',
    },
    type: UITaskName.PRESS_OTHER_GRAPHIC_STYLE_ELEMENTS,
    points: Score.DAILY_TASK.COMPLETED,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },*/
  /*
  [UITaskName.WHAT_STYLE_TYPES_GAME_HAS]: {
    title: { fi: 'mitä lajityyppiä (tai useampaa) peli sinulle edustaa?' },
    type: UITaskName.WHAT_STYLE_TYPES_GAME_HAS,
    points: Score.DAILY_TASK.COMPLETED,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },*/
  /*
  [UITaskName.PRESS_FAMOUS_CHARACTER]: {
    title: { fi: 'klikkaa pelihahmoa josta tulee mieleen joku tunnettu hahmo' },
    type: UITaskName.PRESS_FAMOUS_CHARACTER,
    points: Score.DAILY_TASK.COMPLETED,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },*/
  /* [UITaskName.WHAT_FAMOUS_GAME_REMINDING]: {
    title: { fi: 'mitä tunnettua peliä tämä peli muistuttaa?' },
    type: UITaskName.WHAT_FAMOUS_GAME_REMINDING,
    points: Score.DAILY_TASK.COMPLETED,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },*/
  /*
  [UITaskName.CHOOSE_CULTURAL_GUIDELINE_CLAN_DESCRIPTION]: {
    title: { fi: 'valitse klaanin kuvaukseen toimintakulttuurinen ohje' },
    type: UITaskName.CHOOSE_CULTURAL_GUIDELINE_CLAN_DESCRIPTION,
    points: Score.DAILY_TASK.COMPLETED,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },*/
  /*
  [UITaskName.CHANGE_LANGUAGE]: {
    title: {
      fi: 'katso kieliasetukset ja klikkaa kohtia jotka muuttuvat eri kielien välillä',
    },
    type: UITaskName.CHANGE_LANGUAGE,
    points: Score.DAILY_TASK.COMPLETED,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },*/
  /* [UITaskName.PRESS_MONEY_STUFF]: {
    title: { fi: 'klikkaa asioita, joissa voi käyttää rahaa' },
    type: UITaskName.PRESS_MONEY_STUFF,
    points: Score.DAILY_TASK.COMPLETED,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },
  */
  /*
  [UITaskName.USE_ONLY_POSITIVE_GESTURES_IN_BATTLE]: {
    title: {
      fi: 'käytä matsin aikana vain positiivisia ja kannustavia eleitä',
    },
    type: UITaskName.USE_ONLY_POSITIVE_GESTURES_IN_BATTLE,
    points: Score.DAILY_TASK.COMPLETED,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },*/
  /* [UITaskName.USE_ONLY_NEGATIVE_GESTURES_IN_BATTLE]: {
    title: { fi: 'käytä matsin aikana vain negatiivisia eleitä' },
    type: UITaskName.USE_ONLY_NEGATIVE_GESTURES_IN_BATTLE,
    points: Score.DAILY_TASK.COMPLETED,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },*/
  /*[UITaskName.PRESS_PRIZE_GIVING_ITEMS]: {
    title: {
      fi: 'tunnista ja paina kohtia, joissa peli palkitsee sinua jotenkin',
    },
    type: UITaskName.PRESS_PRIZE_GIVING_ITEMS,
    points: Score.DAILY_TASK.COMPLETED,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },*/
  /*[UITaskName.PRESS_ACCESSIBILITY_SETTINGS]: {
    title: { fi: 'etsi ja klikkaa kaikkia saavutettavuus-asetuksia' },
    type: UITaskName.PRESS_ACCESSIBILITY_SETTINGS,
    points: Score.DAILY_TASK.COMPLETED,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },*/
  /* [UITaskName.PRESS_ETHIC_QUESTIONABLE_OBJECTS]: {
    title: { fi: 'etsi ja klikkaa eettisesti arveluttavia asioita' },
    type: UITaskName.PRESS_ETHIC_QUESTIONABLE_OBJECTS,
    points: Score.DAILY_TASK.COMPLETED,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },*/
  /* [UITaskName.PRESS_RESPONSIBILITY_OBJECTS]: {
    title: { fi: 'etsi ja klikkaa vastuullisuuteen liittyviä asioita' },
    type: UITaskName.PRESS_RESPONSIBILITY_OBJECTS,
    points: Score.DAILY_TASK.COMPLETED,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },*/
  /* [UITaskName.PRESS_SUSTAINABLE_CONSUMPTION_OBJECTS]: {
    title: { fi: 'etsi ja klikkaa kestävään kuluttamiseen liittyviä asioita' },
    type: UITaskName.PRESS_SUSTAINABLE_CONSUMPTION_OBJECTS,
    points: Score.DAILY_TASK.COMPLETED,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },*/
  /*[UITaskName.PRESS_VALUES_OBJECTS]: {
    title: { fi: 'etsi ja klikkaa arvoihin liittyviä asioita' },
    type: UITaskName.PRESS_VALUES_OBJECTS,
    points: Score.DAILY_TASK.COMPLETED,
    coins: 10,
    amount: 1,
    timeLimitMinutes: 60,
  },*/
};
