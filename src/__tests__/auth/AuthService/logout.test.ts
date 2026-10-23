import { AuthService } from '../../../auth/auth.service';
import AuthModule from '../modules/auth.module';
import { JwtService } from '@nestjs/jwt';
import { ObjectId } from 'mongodb';
import AuthBuilderFactory from '../../auth/data/authBuilderFactory';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService.logout() test suite', () => {
  let authService: AuthService;
  let jwtService: JwtService;

  let tokenData: {
    token_id: ObjectId;
    session_id: string;
    profile_id: string;
    player_id: string;
    type: string;
  };

  const token_id = new ObjectId();
  const session_id = '12345';

  const sessionModel = AuthModule.getSessionModel();

  beforeEach(async () => {
    authService = await AuthModule.getAuthService();
    jwtService = await AuthModule.getJwtService();

    tokenData = {
      token_id: token_id,
      session_id: session_id,
      profile_id: new ObjectId().toString(),
      player_id: new ObjectId().toString(),
      type: 'refresh',
    };
  });

  const createRefreshSession = async () => {
    const refreshToken = await jwtService.signAsync(tokenData);
    const decoded = await jwtService.decode(refreshToken);

    const existingSession = AuthBuilderFactory.getBuilder('Session')
      .setId(token_id)
      .setSessionId(session_id)
      .setProfileId(decoded.profile_id)
      .setTokenHash(await authService.tokenHash(refreshToken))
      .setExpiresAt(new Date(decoded.exp * 1000))
      .build();

    await sessionModel.create(existingSession);

    return refreshToken;
  };

  it('Should update revokedAt to be current Date', async () => {
    const refreshToken = await createRefreshSession();

    await authService.logout(refreshToken);

    const session = await sessionModel.findById(token_id);
    expect(session.revokedAt).not.toBe(null);
  });

  it('Should not update revokedAt of another session', async () => {
    const refreshToken = await createRefreshSession();
    const new_id = new ObjectId();

    const anotherSession = AuthBuilderFactory.getBuilder('Session')
      .setId(new_id)
      .setSessionId('09876')
      .setProfileId(new ObjectId())
      .setTokenHash(await authService.tokenHash(refreshToken))
      .setExpiresAt(new Date())
      .build();

    await sessionModel.create(anotherSession);

    await authService.logout(refreshToken);

    const session = await sessionModel.findById(new_id);
    expect(session.revokedAt).toBe(null);
  });

  it('Should throw UnauthorizedException if type is invalid', async () => {
    tokenData.type = 'reset';
    const refreshToken = await createRefreshSession();

    await expect(authService.logout(refreshToken)).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
