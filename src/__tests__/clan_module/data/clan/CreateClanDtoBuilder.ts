import { CreateClanDto } from "../../../../clan_module/clan/dto/createClan.dto";
import { AgeRange } from "../../../../clan_module/clan/enum/ageRange.enum";
import { ClanLabel } from "../../../../clan_module/clan/enum/clanLabel.enum";
import { Goal } from "../../../../clan_module/clan/enum/goal.enum";
import { Language } from "../../../../common/enum/language.enum";
import IDataBuilder from "../../../test_utils/interface/IDataBuilder";

export default class CreateClanDtoBuilder implements IDataBuilder<CreateClanDto>{
    private readonly base: CreateClanDto = {
        name: 'clan',
        tag: 'tag',
        labels: [ ClanLabel.ANIMEFANIT, ClanLabel.ELÄINRAKKAAT ],
        phrase: 'We are the best',
        isOpen: true,
        ageRange: AgeRange.ADULTS,
        goal: Goal.GRINDAUS,
        language: Language.ENGLISH
    }

    build() {
        return {...this.base};
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

    setPhrase(phrase: string) {
        this.base.phrase = phrase;
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

    setLanguage(language: Language) {
        this.base.language = language;
        return this;
    }
}