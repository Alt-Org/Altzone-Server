import { TokenName } from '../../../auth/enum/tokenName.enum';
import { AuthService } from '../../../auth/auth.service';
import { Response } from 'express';
import AuthModule from '../modules/auth.module';

describe('clearCookies', () => {
  let authService: AuthService;

  beforeEach(async () => {
    authService = await AuthModule.getAuthService();
  });

  it('Should clear cookies by replacing them with expires ones', () => {
    const response = {
      clearCookie: jest.fn().mockReturnThis(),
    } as unknown as Response;

    authService.clearCookies(response);

    expect(response.clearCookie).toHaveBeenNthCalledWith(
      1,
      TokenName.ACCESS_TOKEN,
      { path: '/' },
    );

    expect(response.clearCookie).toHaveBeenNthCalledWith(
      2,
      TokenName.REFRESH_TOKEN,
      { path: '/auth/refresh' },
    );
  });
});
