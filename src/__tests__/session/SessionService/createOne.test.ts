import { ObjectId } from 'mongodb';
import SessionModule from "../modules/session.module";
import SessionService from "../../../session/session.service";

describe('SessionService.createOne() test suite', () => {
  let sessionService: SessionService;

  let sessionPayload: {
    _id: ObjectId;
    session_id: string;
    profile_id: string;
    tokenHash: string;
    expiresAt: Date;
  };
  
  beforeEach(async () => {
    sessionService = await SessionModule.getSessionService();

    sessionPayload = {
      _id: new ObjectId(),
      session_id: '1234',
      profile_id: new ObjectId().toString(),
      tokenHash: 'TokenHash',
      expiresAt: new Date(),
    };
  });

  it('Should return created Session if payload is valid', async () => {
    const [result, errors] = await sessionService.createOne(sessionPayload);

    expect(errors).toBeNull();
    expect(result._id).toBe(sessionPayload._id);
  });

  it('Should return ServiceError with reason REQUIRED if payload is invalid', async () => {
    sessionPayload.profile_id = null;
    const [result, errors] = await sessionService.createOne(sessionPayload);

    expect(result).toBeNull();
    expect(errors).toContainSE_REQUIRED();
  });
});
