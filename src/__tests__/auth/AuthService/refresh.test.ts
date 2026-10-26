import ProfileModule from '../../../__tests__/profile/modules/profile.module';
import { AuthService } from '../../../auth/auth.service';
import AuthModule from '../modules/auth.module';
import { JwtService } from '@nestjs/jwt';
import ProfileBuilderFactory from '../../../__tests__/profile/data/profileBuilderFactory';
import PlayerModule from '../../../__tests__/player/modules/player.module';
import PlayerBuilderFactory from '../../../__tests__/player/data/playerBuilderFactory';
import { ObjectId } from 'mongodb';
import AuthBuilderFactory from '../../auth/data/authBuilderFactory';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService.refresh() test suite', () => {
  let authService: AuthService;
  let jwtService: JwtService;

  let tokenData: {
    token_id: ObjectId;
    session_id: string;
    profile_id: string;
    player_id: string;
    type: string;
  };

  let player_id: string;

  const token_id = new ObjectId();
  const session_id = '12345';

  const profileModel = ProfileModule.getProfileModel();
  const existingProfile = ProfileBuilderFactory.getBuilder('Profile').build();

  const playerModel = PlayerModule.getPlayerModel();
  const existingPlayer = PlayerBuilderFactory.getBuilder('Player').build();

  const sessionModel = AuthModule.getSessionModel();

  beforeEach(async () => {
    authService = await AuthModule.getAuthService();
    jwtService = await AuthModule.getJwtService();

    const createdProfile = await profileModel.create(existingProfile);
    existingPlayer.profile_id = createdProfile._id;

    const createdPlayer = await playerModel.create(existingPlayer);
    player_id = createdPlayer._id;

    tokenData = {
      token_id: token_id,
      session_id: session_id,
      profile_id: createdProfile._id,
      player_id: createdPlayer._id,
      type: 'refresh',
    };
  });

  const createRefreshSession = async () => {
    const refreshToken = await jwtService.signAsync(tokenData);
    const decoded = await jwtService.decode(refreshToken);

    const existingSession = AuthBuilderFactory.getBuilder('Session')
      .setId(token_id)
      .setSessionId(session_id)
      .setProfileId(new ObjectId(existingProfile._id))
      .setTokenHash(await authService.tokenHash(refreshToken))
      .setExpiresAt(new Date(decoded.exp * 1000))
      .build();

    await sessionModel.create(existingSession);

    return refreshToken;
  };

  it('Should return tokens if refresh token is valid', async () => {
    const refreshToken = await createRefreshSession();

    const [result] = await authService.refresh(refreshToken);
    expect(result).toHaveProperty('accessToken');
    expect(result).toHaveProperty('refreshToken');
  });

  it('Should throw UnauthorizedException if type is invalid', async () => {
    tokenData.type = 'reset';
    const refreshToken = await createRefreshSession();

    await expect(authService.refresh(refreshToken)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('Should revoke session and throw UnauthorizedException if session revokedAt is not null', async () => {
    const refreshToken = await createRefreshSession();

    const anotherSession = AuthBuilderFactory.getBuilder('Session')
      .setId(new ObjectId())
      .setSessionId(session_id)
      .setProfileId(new ObjectId(existingProfile._id))
      .setTokenHash(await authService.tokenHash(refreshToken))
      .setExpiresAt(new Date())
      .build();

    await sessionModel.create(anotherSession);

    await sessionModel.updateOne(
      { _id: token_id },
      { $set: { revokedAt: new Date() } },
    );

    await expect(authService.refresh(refreshToken)).rejects.toThrow(
      UnauthorizedException,
    );

    const sessions = await sessionModel.find({ session_id: session_id });
    expect(sessions[0].revokedAt).not.toBeNull();
    expect(sessions[1].revokedAt).not.toBeNull();
  });

  it('Should throw UnauthorizedException if token inactivity past limit', async () => {
    const refreshToken = await createRefreshSession();

    const decoded = await jwtService.decode(refreshToken);

    decoded.iat = Math.floor(Date.now() / 1000) - 8 * 24 * 60 * 60;
    delete decoded.exp;

    const updatedToken = await jwtService.signAsync(decoded);

    await expect(authService.refresh(updatedToken)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('Should return null if session not found', async () => {
    const refreshToken = await createRefreshSession();

    await sessionModel.deleteOne({ _id: token_id });

    const result = await authService.refresh(refreshToken);
    expect(result).toBeNull();
  });

  it('Should return null if profile not found', async () => {
    tokenData.profile_id = new ObjectId().toString();
    const refreshToken = await createRefreshSession();

    const result = await authService.refresh(refreshToken);
    expect(result).toBeNull();
  });

  it('Should return null if player not found', async () => {
    await playerModel.deleteOne({ _id: player_id });

    const refreshToken = await createRefreshSession();

    const result = await authService.refresh(refreshToken);
    expect(result).toBeNull();
  });
});
