import {UpdateClanDto} from "../../../../clan/dto/updateClan.dto";
import {ClanLabel} from "../../../../clan/enum/clanLabel.enum";
import {AgeRange} from "../../../../clan/enum/ageRange.enum";
import {Goal} from "../../../../clan/enum/goal.enum";
import {Language} from "../../../../common/enum/language.enum";

export default class UpdateClanDtoBuilder {
    private readonly base: UpdateClanDto = {
        _id: undefined,
        name: undefined,
        tag: undefined,
        labels: undefined,
        admin_idsToAdd: undefined,
        admin_idsToDelete: undefined,
        isOpen: undefined,
        ageRange: undefined,
        goal: undefined,
        phrase: undefined,
        language: undefined,
        clanLogo: undefined
    };

    build() {
        return { ...this.base } as UpdateClanDto;
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

    setAdminIdsToAdd(adminIds: string[]) {
        this.base.admin_idsToAdd = adminIds;
        return this;
    }

    setAdminIdsToDelete(adminIds: string[]) {
        this.base.admin_idsToDelete = adminIds;
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