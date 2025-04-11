import { User } from '../../../../auth/user';
import { ObjectId } from 'mongodb';

export default class UserBuilder {
  private profileId: string = undefined;
  private playerId: string = undefined;
  private clanId: string = undefined;

  build(): User {
    return new User(this.profileId, this.playerId, this.clanId);
  }

  setProfileId(profileId: string | ObjectId) {
    this.profileId = profileId as any;
    return this;
  }

  setPlayerId(playerId: string | ObjectId) {
    this.playerId = playerId as any;
    return this;
  }

  setClanId(clanId: string | ObjectId) {
    this.clanId = clanId as any;
    return this;
  }
}
