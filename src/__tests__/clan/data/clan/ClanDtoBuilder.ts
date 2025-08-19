import { Language } from '../../../../common/enum/language.enum';
import IDataBuilder from '../../../test_utils/interface/IDataBuilder';
import { ClanLabel } from '../../../../clan/enum/clanLabel.enum';
import { AgeRange } from '../../../../clan/enum/ageRange.enum';
import { Goal } from '../../../../clan/enum/goal.enum';
import { ClanDto } from '../../../../clan/dto/clan.dto';
import { ClanLogoDto } from '../../../../clan/dto/clanLogo.dto';
import ClanRoleDto from '../../../../clan/role/dto/clanRole.dto';
import { Stall } from '../../../../clan/stall/stall.schema';

export default class ClanDtoBuilder implements IDataBuilder<ClanDto> {
  private readonly base: ClanDto = {
    _id: '',
    name: '',
    tag: '',
    labels: [],
    gameCoins: 0,
    points: 0,
    admin_ids: [],
    playerCount: 0,
    itemCount: 0,
    stockCount: 0,
    isOpen: true,
    password: undefined,
    ageRange: AgeRange.ALL,
    goal: Goal.NONE,
    phrase: '',
    clanLogo: new ClanLogoDto(),
    language: Language.NONE,
    roles: [],
    stall: new Stall(),
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

  setPoints(points: number) {
    this.base.points = points;
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

  setPassword(password: string) {
    this.base.password = password;
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

  setRoles(roles: ClanRoleDto[]) {
    this.base.roles = roles;
    return this;
  }

  setStall(stall: Stall) {
    this.base.stall = stall;
    return this;
  }
}
