import { Language } from '../../../../common/enum/language.enum';
import IDataBuilder from '../../../test_utils/interface/IDataBuilder';
import { CreateClanDto } from '../../../../clan/dto/createClan.dto';
import { ClanLabel } from '../../../../clan/enum/clanLabel.enum';
import { AgeRange } from '../../../../clan/enum/ageRange.enum';
import { Goal } from '../../../../clan/enum/goal.enum';
import { LogoType } from '../../../../clan/enum/logoType.enum';

export default class CreateClanDtoBuilder
  implements IDataBuilder<CreateClanDto>
{
  private readonly base: CreateClanDto = {
    name: 'clan',
    tag: 'tag',
    labels: [ClanLabel.ANIMEFANIT, ClanLabel.ELÄINRAKKAAT],
    phrase: 'We are the best',
    isOpen: true,
    ageRange: AgeRange.ADULTS,
    goal: Goal.GRINDAUS,
    language: Language.ENGLISH,
    clanLogo: { logoType: LogoType.HEART, pieceColors: ['#FFFFFF', '#000000'] },
  };

  build() {
    return { ...this.base };
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
