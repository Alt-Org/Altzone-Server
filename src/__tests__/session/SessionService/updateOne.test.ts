import { Session } from "../../../session/session.schema";
import SessionService from "../../../session/session.service";
import SessionBuilderFactory from "../data/sessionBuilderFactory";
import SessionModule from "../modules/session.module";
import { ObjectId } from 'mongodb';
import { getNonExisting_id } from '../../test_utils/util/getNonExisting_id';

describe('SessionService.updateOne() test suite', () => {
  let sessionService: SessionService;
  let existingSession: Session;

  const sessionBuilder = SessionBuilderFactory.getBuilder('Session');
  const sessionModel = SessionModule.getSessionModel();

  beforeEach(async () => {
    sessionService = await SessionModule.getSessionService();

    const sessionToCreate = sessionBuilder
      .setId(new ObjectId())
      .setSessionId('1234')
      .setProfileId(new ObjectId())
      .setTokenHash('fakeTokenHash')
      .setExpiresAt(new Date())
      .build();
    const sessionResp = await sessionModel.create(sessionToCreate);
    existingSession = sessionResp.toObject();
  });

  it('Should update the session that matches the provided filter and return true ', async () => {
    const [result, errors] = await sessionService.updateOne(
      { revokedAt: new Date() },
      { filter: { _id: existingSession._id } },
    );

    expect(result).toBe(true);
    expect(errors).toBeNull();
  });

  it('Should return ServiceError NOT_FOUND if no session matches the provided filter ', async () => {
    const [result, errors] = await sessionService.updateOne(
      { revokedAt: new Date() },
      { filter: { _id: getNonExisting_id() } },
    );

    expect(result).toBe(null);
    expect(errors).toContainSE_NOT_FOUND();
  });
});
