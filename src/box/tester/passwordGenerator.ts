import {Injectable} from "@nestjs/common";

/**
 * Language of the password
 */
type PasswordLanguage = 'fi';

/**
 * Type of the password
 */
type PasswordType = 'sentence' | 'place';


/**
 * Base data of which the password can be generated, which is
 * a record of words, where
 * the key is a position in the password starting with zero and
 * array of possible words for this position
 */
type PasswordBase = Record<number, PasswordWord[]>
type PasswordWord = Record<PasswordLanguage, string>;

@Injectable()
export class PasswordGenerator {

    private readonly sentencePasswordBase: PasswordBase = {
        0: [
            {fi: "kettu"}, {fi: "panda"}, {fi: "varis"}, {fi: "hevonen"}, {fi: "apina"},
            {fi: "gorilla"}, {fi: "strutsi"}, {fi: "lehmä"}, {fi: "pupu"}, {fi: "pöllö"},
            {fi: "ilves"}, {fi: "vuohi"}, {fi: "norsu"}, {fi: "sammakko"}, {fi: "hirvi"},
            {fi: "mäyrä"}, {fi: "karhu"}, {fi: "karppi"}, {fi: "orava"}, {fi: "pingviini"},
            {fi: "poro"}, {fi: "kissa"}, {fi: "peura"}, {fi: "haukka"}, {fi: "krokotiili"},
            {fi: "sarvikuono"}, {fi: "lintu"}, {fi: "ahma"}, {fi: "kana"}, {fi: "marsu"},
            {fi: "sika"}, {fi: "sorsa"}, {fi: "myyrä"}, {fi: "käärme"}, {fi: "hiiri"},
            {fi: "lammas"}, {fi: "kotka"}, {fi: "jänis"}, {fi: "hylje"}, {fi: "koira"}
        ],
        1: [
            {fi: "keräilee"}, {fi: "soutaa"}, {fi: "sukeltaa"}, {fi: "purjehtii"}, {fi: "näkee"},
            {fi: "kaivaa"}, {fi: "miettii"}, {fi: "ostaa"}, {fi: "kaataa"}, {fi: "laulaa"},
            {fi: "rakentaa"}, {fi: "hyppää"}, {fi: "juoksee"}, {fi: "ratsastaa"}, {fi: "syö"},
            {fi: "lentää"}, {fi: "kävelee"}, {fi: "leikkii"}, {fi: "katsoo"}, {fi: "lukee"},
            {fi: "kirjoittaa"}, {fi: "vilkuttaa"}, {fi: "itkee"}, {fi: "kuuntelee"}, {fi: "soittaa"},
            {fi: "juo"}, {fi: "tanssii"}, {fi: "haistaa"}, {fi: "tanssii"}, {fi: "viljelee"},
            {fi: "nukkuu"}, {fi: "pyöräilee"}, {fi: "piirtää"}, {fi: "metsästää"}, {fi: "nauraa"},
            {fi: "leipoo"}, {fi: "kierii"}, {fi: "maalasi"}, {fi: "huutaa"}, {fi: "ui"}
        ],
        2: [
            {fi: "salaattia"}, {fi: "kermaa"}, {fi: "suolaa"}, {fi: "pähkinöitä"}, {fi: "pähkinöitä"},
            {fi: "riisiä"}, {fi: "suklaata"}, {fi: "teetä"}, {fi: "marjoja"}, {fi: "limonadia"},
            {fi: "omenaa"}, {fi: "sieniä"}, {fi: "herneitä"}, {fi: "mehua"}, {fi: "banaania"},
            {fi: "omenamehua"}, {fi: "juustoa"}, {fi: "lihaa"}, {fi: "sämpylää"}, {fi: "puuroa"},
            {fi: "kahvia"}, {fi: "pippuria"}, {fi: "maitoa"}, {fi: "jäätelöä"}, {fi: "makkaraa"},
            {fi: "heinää"}, {fi: "sipulia"}, {fi: "porkkanaa"}, {fi: "mansikoita"}, {fi: "sokeria"},
            {fi: "leipää"}, {fi: "vadelmia"}, {fi: "vettä"}, {fi: "muroja"}, {fi: "kaurapuuroa"},
            {fi: "jäätelöä"}, {fi: "mustikoita"}, {fi: "kirsikoita"}, {fi: "kalaa"}, {fi: "hunajaa"}
        ]
    }

    private readonly placePasswordBase: PasswordBase = {
        0: [
            {fi: "surullinen"}, {fi: "meluisa"}, {fi: "viisas"}, {fi: "iloinen"}, {fi: "lyhyt"},
            {fi: "ystävällinen"}, {fi: "karvainen"}, {fi: "nuori"}, {fi: "vahva"}, {fi: "väsynyt"},
            {fi: "onnellinen"}, {fi: "nälkäinen"}, {fi: "pieni"}, {fi: "rohkea"}, {fi: "ystävällinen"},
            {fi: "hauska"}, {fi: "reipas"}, {fi: "laiska"}, {fi: "kiireinen"}, {fi: "tyhmä"},
            {fi: "arvokas"}, {fi: "peloton"}, {fi: "näyttävä"}, {fi: "ihana"}, {fi: "lempeä"},
            {fi: "utelias"}, {fi: "valoisa"}, {fi: "upea"}, {fi: "iso"}, {fi: "ahkera"},
            {fi: "nopea"}, {fi: "upea"}, {fi: "pitkä"}, {fi: "heikko"}, {fi: "vanha"},
            {fi: "vakava"}, {fi: "hiljainen"}, {fi: "hidas"}, {fi: "kaunis"}, {fi: "pimeä"}
        ],
        1: [
            {fi: "peura"}, {fi: "kettu"}, {fi: "kotka"}, {fi: "koala"}, {fi: "myyrä"},
            {fi: "marsu"}, {fi: "karppi"}, {fi: "hevonen"}, {fi: "krokotiili"}, {fi: "lintu"},
            {fi: "pöllö"}, {fi: "sika"}, {fi: "pingviini"}, {fi: "haukka"}, {fi: "sarvikuono"},
            {fi: "karhu"}, {fi: "lammas"}, {fi: "kissa"}, {fi: "sammakko"}, {fi: "susi"},
            {fi: "varis"}, {fi: "käärme"}, {fi: "strutsi"}, {fi: "kana"}, {fi: "tapiri"},
            {fi: "hiiri"}, {fi: "ahma"}, {fi: "vuohi"}, {fi: "poro"}, {fi: "ilves"},
            {fi: "mäyrä"}, {fi: "jänis"}, {fi: "sorsa"}, {fi: "pupu"}, {fi: "hirvi"},
            {fi: "koira"}, {fi: "panda"}, {fi: "hylje"}, {fi: "gorilla"}, {fi: "norsu"}
        ],
        2: [
            {fi: "kylpyhuoneessa"}, {fi: "portilla"}, {fi: "tuolilla"}, {fi: "koulussa"}, {fi: "kadun-varrella"},
            {fi: "kadulla"}, {fi: "kaupungissa"}, {fi: "saarella"}, {fi: "kivellä"}, {fi: "metsässä"},
            {fi: "oven-edessä"}, {fi: "järvellä"}, {fi: "satamassa"}, {fi: "teatterissa"}, {fi: "kirjastossa"},
            {fi: "huoneessa"}, {fi: "keittiössä"}, {fi: "autossa"}, {fi: "rannalla"}, {fi: "kaapissa"},
            {fi: "puussa"}, {fi: "asemalla"}, {fi: "pellolla"}, {fi: "pihalla"}, {fi: "sillalla"},
            {fi: "teltassa"}, {fi: "kaupassa"}, {fi: "vieressä"}, {fi: "sairaalassa"}, {fi: "torilla"},
            {fi: "puutarhassa"}, {fi: "kellarissa"}, {fi: "mökissä"}, {fi: "vuorella"}, {fi: "kellarissa"},
            {fi: "parvekkeella"}, {fi: "tornissa"}, {fi: "pöydällä"}, {fi: "sängyssä"}, {fi: "talossa"}
        ]
    }

    /**
     * Generates a random words password, which is easy to remember.
     *
     * @param language language of the password
     *
     * @returns generated password
     */
    generatePassword(language: PasswordLanguage): string {
        const type = this.getRandomPasswordType();
        const base = this.getPasswordBase(type);
        const wordsCount = Object.keys(base).length;

        let password = '';

        for (let i = 0; i < wordsCount; i++) {
            const word = this.getShuffledWord(base[i])[language];
            password += word + '-';
        }
        password = password.slice(0, password.length - 1);

        return password;
    }

    /**
     * Shuffles an array and gets the first word from a shuffled array
     * @param words array of words
     * @private
     * @returns random word
     */
    private getShuffledWord(words: PasswordWord[]): PasswordWord {
        if (!words.length)
            return words[0];
        return this.shuffleArray(words)[0];
    }

    /**
     * Shuffles a provided array
     * @param array array to shuffle
     * @private
     * @returns shuffled array
     */
    private shuffleArray<T>(array: T[]): T[] {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }

    /**
     * Gets the required base for the password type
     * @param type type of the password
     * @private
     * @returns the required password base, sentence type is a default
     */
    private getPasswordBase(type: PasswordType): PasswordBase {
        switch (type) {
            case 'sentence':
                return this.sentencePasswordBase;
            case 'place':
                return this.placePasswordBase;
            default:
                return this.sentencePasswordBase;
        }
    }

    /**
     * Chooses a random password type
     * @private
     * @returns random password type
     */
    private getRandomPasswordType(): PasswordType {
        return Math.random() < 0.49 ? 'place' : 'sentence';
    }

    /**
     * Get a random number within the specified range
     * @param min minimum number
     * @param max maximum number
     * @private
     * @returns generated int number
     */
    private getRandomNumber(min: number, max: number) {
        return min + (Math.random() * (max - min + 1)) | 0;
    }
}
