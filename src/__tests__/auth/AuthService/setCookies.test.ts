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
    const accessExpires = 3600000;
    const refreshExpires = 3600000;

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
        maxAge: accessExpires,
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
        maxAge: refreshExpires,
      },
    );
  });
});
