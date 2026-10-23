import ProfileModule from '../../../__tests__/profile/modules/profile.module';
import { AuthService } from '../../../auth/auth.service';
import AuthModule from '../modules/auth.module';
import { JwtService } from '@nestjs/jwt';
import ProfileBuilderFactory from '../../../__tests__/profile/data/profileBuilderFactory';
import PlayerModule from '../../../__tests__/player/modules/player.module';
import PlayerBuilderFactory from '../../../__tests__/player/data/playerBuilderFactory';
import { ObjectId } from 'mongodb';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService.refresh() test suite', () => {
  let authService: AuthService;
  let jwtService: JwtService;
  let refreshToken: string;
  let playerId: string;

  let tokenData: {
    profile_id: string;
    player_id: string;
    tokenVersion: number;
    type: string;
  };

  const profileModel = ProfileModule.getProfileModel();
  const existingProfile = ProfileBuilderFactory.getBuilder('Profile').build();

  const playerModel = PlayerModule.getPlayerModel();
  const existingPlayer = PlayerBuilderFactory.getBuilder('Player').build();

  beforeEach(async () => {
    authService = await AuthModule.getAuthService();
    jwtService = await AuthModule.getJwtService();

    const createdProfile = await profileModel.create(existingProfile);
    existingProfile.tokenVersion = createdProfile.tokenVersion;
    existingPlayer.profile_id = createdProfile._id;

    const createdPlayer = await playerModel.create(existingPlayer);
    playerId = createdPlayer._id;

    tokenData = {
      profile_id: createdProfile._id,
      player_id: createdPlayer._id,
      tokenVersion: createdProfile.tokenVersion,
      type: 'refresh',
    };
  });

  it('Should return tokens if refresh token is valid', async () => {
    refreshToken = await jwtService.signAsync(tokenData);

    const result = await authService.refresh(refreshToken);
    expect(result).toHaveProperty('accessToken');
    expect(result).toHaveProperty('refreshToken');
  });

  it('Should throw UnauthorizedException if type is invalid', async () => {
    tokenData.type = 'reset';
    refreshToken = await jwtService.signAsync(tokenData);

    await expect(authService.refresh(refreshToken)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('Should return null if profile not found', async () => {
    tokenData.profile_id = new ObjectId().toString();
    refreshToken = await jwtService.signAsync(tokenData);

    const result = await authService.refresh(refreshToken);
    expect(result).toBeNull();
  });

  it('Should throw UnauthorizedException if token version is invalid', async () => {
    tokenData.tokenVersion = existingProfile.tokenVersion + 1;
    refreshToken = await jwtService.signAsync(tokenData);

    await expect(authService.refresh(refreshToken)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('Should return null if player not found', async () => {
    await playerModel.deleteOne({ _id: playerId });

    refreshToken = await jwtService.signAsync(tokenData);

    const result = await authService.refresh(refreshToken);
    expect(result).toBeNull();
  });
});
