import { GameStatistics } from '../../../../player/gameStatistics.schema';
import { Player } from '../../../../player/schemas/player.schema';
import { ObjectId } from 'mongodb';
import { Avatar } from '../../../../player/schemas/avatar.schema';

export default class PlayerBuilder {
  private readonly base: Player = {
    name: 'defaultPlayer',
    backpackCapacity: 10,
    points: 0,
    battlePoints: 0,
    uniqueIdentifier: 'unique-id',
    above13: true,
    parentalAuth: true,
    currentAvatarId: 101,
    gameStatistics: {
      playedBattles: 0,
      wonBattles: 0,
      diamondsAmount: 0,
      startedVotings: 0,
    } as any,
    profile_id: undefined,
    clan_id: undefined,
    battleCharacter_ids: [],
    avatar: {
      head: 1,
      hair: 1,
      eyes: 1,
      nose: 1,
      mouth: 1,
      eyebrows: 1,
      clothes: 1,
      feet: 1,
      hands: 1,
      skinColor: '#f5cba7',
    },
    clanRole_id: null,
    _id: undefined,
  };

  build(): Player {
    return { ...this.base } as Player;
  }

  setId(id: string | ObjectId) {
    this.base._id = id as any;
    return this;
  }

  setName(name: string) {
    this.base.name = name;
    return this;
  }

  setBackpackCapacity(capacity: number) {
    this.base.backpackCapacity = capacity;
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

  setUniqueIdentifier(identifier: string) {
    this.base.uniqueIdentifier = identifier;
    return this;
  }

  setAbove13(above13: boolean | null) {
    this.base.above13 = above13;
    return this;
  }

  setParentalAuth(parentalAuth: boolean | null) {
    this.base.parentalAuth = parentalAuth;
    return this;
  }

  setCurrentAvatarId(currentAvatarId: number) {
    this.base.currentAvatarId = currentAvatarId;
    return this;
  }

  setAvatar(avatar: Avatar) {
    this.base.avatar = avatar;
    return this;
  }

  setGameStatistics(gameStatistics: GameStatistics) {
    this.base.gameStatistics = gameStatistics;
    return this;
  }

  setProfileId(profileId: string | ObjectId) {
    this.base.profile_id = profileId as any;
    return this;
  }

  setClanId(clanId: string | ObjectId) {
    this.base.clan_id = clanId as any;
    return this;
  }

  setBattleCharacterIds(_ids?: string[] | ObjectId[]) {
    this.base.battleCharacter_ids = _ids as any;
    return this;
  }

  setClanRoleId(clanRole_id: string | ObjectId | null) {
    this.base.clanRole_id = clanRole_id as any;
    return this;
  }
}
