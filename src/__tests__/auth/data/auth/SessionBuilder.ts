import { ObjectId } from 'mongodb';

export class SessionDto {
  _id: ObjectId;
  session_id: string;
  profile_id: ObjectId;
  tokenHash: string;
  expiresAt: Date;
}

export default class SessionDtoBuilder {
  private readonly base: SessionDto = {
    _id: undefined,
    session_id: undefined,
    profile_id: undefined,
    tokenHash: undefined,
    expiresAt: undefined,
  };

  build(): SessionDto {
    return { ...this.base } as SessionDto;
  }

  setId(_id: ObjectId) {
    this.base._id = _id;
    return this;
  }

  setSessionId(session_id: string) {
    this.base.session_id = session_id;
    return this;
  }

  setProfileId(profile_id: ObjectId) {
    this.base.profile_id = profile_id;
    return this;
  }

  setTokenHash(tokenHash: string) {
    this.base.tokenHash = tokenHash;
    return this;
  }

  setExpiresAt(expiresAt: Date) {
    this.base.expiresAt = expiresAt;
    return this;
  }
}
