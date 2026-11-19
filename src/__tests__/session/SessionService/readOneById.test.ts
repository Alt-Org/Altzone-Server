import { Session } from "../../../session/session.schema";
import SessionService from "../../../session/session.service";
import SessionBuilderFactory from "../data/sessionBuilderFactory";
import SessionModule from "../modules/session.module";
import { ObjectId } from 'mongodb';
import { getNonExisting_id } from '../../test_utils/util/getNonExisting_id';

describe('SessionService.readOneById() test suite', () => {
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

  it('Should find existing session from DB', async () => {
    const [result, errors] = await sessionService.readOneById(existingSession._id.toString());

    expect(errors).toBeNull();
    expect(result).toEqual(expect.objectContaining(existingSession));
  });

  it('Should return null for non-existing session', async () => {
    const [result, errors] = await sessionService.readOneById(getNonExisting_id());

    expect(result).toBeNull();
    expect(errors).toContainSE_NOT_FOUND();
  });
});
