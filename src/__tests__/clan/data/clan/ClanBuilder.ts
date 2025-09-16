import { Language } from '../../../../common/enum/language.enum';
import IDataBuilder from '../../../test_utils/interface/IDataBuilder';
import { LogoType } from '../../../../clan/enum/logoType.enum';
import { Clan } from '../../../../clan/clan.schema';
import { ClanLabel } from '../../../../clan/enum/clanLabel.enum';
import { AgeRange } from '../../../../clan/enum/ageRange.enum';
import { Goal } from '../../../../clan/enum/goal.enum';
import { ClanRole } from '../../../../clan/role/ClanRole.schema';
import {
  LeaderClanRole,
  MemberClanRole,
} from '../../../../clan/role/initializationClanRoles';
import { Stall } from '../../../../clan/stall/stall.schema';

export default class ClanBuilder implements IDataBuilder<Clan> {
  private readonly base: Clan = {
    _id: undefined,
    name: 'clan',
    tag: 'my_tag',
    labels: [ClanLabel.ANIMEFANIT, ClanLabel.ELÄINRAKKAAT],
    admin_ids: [],
    playerCount: 0,
    itemCount: 0,
    stockCount: 0,
    points: 0,
    battlePoints: 0,
    gameCoins: 0,
    isOpen: true,
    password: undefined,
    ageRange: AgeRange.ADULTS,
    goal: Goal.GRINDAUS,
    phrase: 'We are the best',
    language: Language.ENGLISH,
    clanLogo: { logoType: LogoType.HEART, pieceColors: ['#FFFFFF', '#000000'] },
    roles: [MemberClanRole, LeaderClanRole] as any,
    stall: {
      adPoster: {
        border: '#000000',
        colour: '#FFFFFF',
        mainFurniture: 'default_furniture',
      },
      maxSlots: 7,
    },
    jukeboxSongs: [],
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

  setBattlePoints(battlePoints: number) {
    this.base.battlePoints = battlePoints;
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

  setRoles(roles: ClanRole[]) {
    this.base.roles = roles;
    return this;
  }

  setStall(stall: Stall) {
    this.base.stall = stall;
    return this;
  }

  setStallMaxSlots(amount: number) {
    this.base.stall.maxSlots = amount;
    return this;
  }

  setJukeboxSongs(songs: string[]) {
    this.base.jukeboxSongs = songs;
    return this;
  }
}
