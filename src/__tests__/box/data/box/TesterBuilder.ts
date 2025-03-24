import { ObjectId } from 'mongodb';
import { Tester } from '../../../../box/schemas/tester.schema';

export default class TesterBuilder {
  private readonly base: Partial<Tester> = {
    profile_id: undefined,
    player_id: undefined,
    isClaimed: false,
  };

  build(): Tester {
    return { ...this.base } as Tester;
  }

  setProfileId(profileId: ObjectId) {
    this.base.profile_id = profileId;
    return this;
  }

  setPlayerId(playerId: ObjectId) {
    this.base.player_id = playerId;
    return this;
  }

  setIsClaimed(isClaimed: boolean) {
    this.base.isClaimed = isClaimed;
    return this;
  }
}
