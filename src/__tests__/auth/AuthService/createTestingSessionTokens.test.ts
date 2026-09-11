import { JwtPayload } from "jsonwebtoken";
import { AuthService } from "../../../auth/auth.service";
import AuthModule from '../modules/auth.module';

describe('AuthService.createTestingSessionTokens() test suite', () => {
  let authService: AuthService;

  beforeEach(async () => {
    authService = await AuthModule.getAuthService();
  });

  it('Should return access and refresh tokens and expiration dates', async () => {
    const payload = {
      profile_id: '12345',
      player_id: '12345',
      tokenVersion: 0,
    };

    const result = await authService.createTestingSessionTokens(payload);

    const accessToken = authService['jwtService'].decode(
      result.accessToken,
    ) as JwtPayload;

    const refreshToken = authService['jwtService'].decode(
      result.refreshToken,
    ) as JwtPayload;

    expect(accessToken.profile_id).toBe(payload.profile_id);
    expect(accessToken.player_id).toBe(payload.player_id);

    expect(refreshToken.profile_id).toBe(payload.profile_id);
    expect(refreshToken.player_id).toBe(payload.player_id);
    expect(refreshToken.tokenVersion).toBe(payload.tokenVersion);
    expect(refreshToken.type).toBe('refresh');

    expect(result.tokenExpires).toBe(accessToken.exp);
    expect(result.refreshTokenExpires).toBe(refreshToken.exp);
  });
});
