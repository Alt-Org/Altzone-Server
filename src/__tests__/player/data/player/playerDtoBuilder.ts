import { PlayerDto } from '../../../../player/dto/player.dto';
import { CustomCharacterDto } from '../../../../player/customCharacter/dto/customCharacter.dto';
import { ClanDto } from '../../../../clan/dto/clan.dto';
import IDataBuilder from '../../../test_utils/interface/IDataBuilder';
import { ObjectId } from 'mongodb';
import { AvatarDto } from '../../../../player/dto/avatar.dto';

export default class PlayerDtoBuilder implements IDataBuilder<PlayerDto> {
  private readonly base: PlayerDto = {
    _id: undefined,
    name: 'defaultPlayer',
    points: 0,
    backpackCapacity: 10,
    uniqueIdentifier: 'unique-id',
    above13: true,
    parentalAuth: false,
    currentAvatarId: 101,
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
    gameStatistics: {
      diamondsAmount: 0,
      participatedVotings: 0,
      playedBattles: 0,
      startedVotings: 0,
      wonBattles: 0,
    },
    profile_id: 'profile-id',
    clan_id: 'clan-id',
    battleCharacter_ids: [],
    Clan: undefined,
    CustomCharacter: [],
  };

  build(): PlayerDto {
    return { ...this.base };
  }

  setId(id: string | ObjectId) {
    this.base._id = id as any;
    return this;
  }

  setName(name: string) {
    this.base.name = name;
    return this;
  }

  setPoints(points: number) {
    this.base.points = points;
    return this;
  }

  setBackpackCapacity(capacity: number) {
    this.base.backpackCapacity = capacity;
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

  setAvatar(avatar: AvatarDto) {
    this.base.avatar = avatar;
    return this;
  }

  setGameStatistics(gameStatistics: any) {
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

  setClan(clan: ClanDto) {
    this.base.Clan = clan;
    return this;
  }

  setCustomCharacters(customCharacters: CustomCharacterDto[]) {
    this.base.CustomCharacter = customCharacters;
    return this;
  }
}
