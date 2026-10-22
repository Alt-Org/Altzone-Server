import { TokenName } from '../../../auth/enum/tokenName.enum';
import { AuthService } from '../../../auth/auth.service';
import { Response } from 'express';
import AuthModule from '../modules/auth.module';

describe('setCookies', () => {
  let authService: AuthService;

  beforeEach(async () => {
    authService = await AuthModule.getAuthService();
  });

  it('Should set access and refresh token cookies', () => {
    const response = {
      cookie: jest.fn().mockReturnThis(),
    } as unknown as Response;

    const accessToken = 'access-token';
    const refreshToken = 'refresh-token';
    const now = Math.floor(Date.now() / 1000);
    const accessExpires = now + 15 * 60;
    const refreshExpires = now + 30 * 24 * 60 * 60;
    const accessExpected = (accessExpires - now) * 1000;
    const refreshExpected = (refreshExpires - now) * 1000;

    authService.setCookies(
      response,
      accessToken,
      refreshToken,
      accessExpires,
      refreshExpires,
    );

    expect(response.cookie).toHaveBeenNthCalledWith(
      1,
      TokenName.ACCESS_TOKEN,
      accessToken,
      {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
        maxAge: accessExpected,
      },
    );

    expect(response.cookie).toHaveBeenNthCalledWith(
      2,
      TokenName.REFRESH_TOKEN,
      refreshToken,
      {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/auth/refresh',
        maxAge: refreshExpected,
      },
    );
  });
});
