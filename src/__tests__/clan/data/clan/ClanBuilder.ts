
import { Language } from "../../../../common/enum/language.enum";
import IDataBuilder from "../../../test_utils/interface/IDataBuilder";
import {LogoType} from "../../../../clan/enum/logoType.enum";
import {Clan} from "../../../../clan/clan.schema";
import {ClanLabel} from "../../../../clan/enum/clanLabel.enum";
import {AgeRange} from "../../../../clan/enum/ageRange.enum";
import {Goal} from "../../../../clan/enum/goal.enum";

export default class ClanBuilder implements IDataBuilder<Clan>{
    private readonly base: Clan = {
        _id: undefined,
        name: 'clan',
        tag: 'my_tag',
        labels: [ClanLabel.ANIMEFANIT, ClanLabel.ELÄINRAKKAAT],
        gameCoins: 0,
        admin_ids: [],
        playerCount: 0,
        itemCount: 0,
        stockCount: 0,
        points: 0,
        isOpen: true,
        ageRange: AgeRange.ADULTS,
        goal: Goal.GRINDAUS,
        phrase: 'We are the best',
        language: Language.ENGLISH,
        clanLogo: { logoType: LogoType.HEART, pieceColors: ['#FFFFFF', '#000000'] }
    };

    // Returns a new Clan object with the current base properties
    build() {
        return { ...this.base };
    }

    setId(id: string) {
        this.base._id = id;
        return this;
    }

    setName(name: string) {
        this.base.name = name;
        return this;
    }

    setTag(tag: string) {
        this.base.tag = tag;
        return this;
    }

    setLabels(labels: ClanLabel[]) {
        this.base.labels = labels;
        return this;
    }

    setGameCoins(gameCoins: number) {
        this.base.gameCoins = gameCoins;
        return this;
    }

    setAdminIds(adminIds: string[]) {
        this.base.admin_ids = adminIds;
        return this;
    }

    setPlayerCount(playerCount: number) {
        this.base.playerCount = playerCount;
        return this;
    }

    setItemCount(itemCount: number) {
        this.base.itemCount = itemCount;
        return this;
    }

    setStockCount(stockCount: number) {
        this.base.stockCount = stockCount;
        return this;
    }

    setIsOpen(isOpen: boolean) {
        this.base.isOpen = isOpen;
        return this;
    }

    setAgeRange(ageRange: AgeRange) {
        this.base.ageRange = ageRange;
        return this;
    }

    setGoal(goal: Goal) {
        this.base.goal = goal;
        return this;
    }

    setPhrase(phrase: string) {
        this.base.phrase = phrase;
        return this;
    }

    setLanguage(language: Language) {
        this.base.language = language;
        return this;
    }
}