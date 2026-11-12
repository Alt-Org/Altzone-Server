import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Inject,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { SignInDto } from './dto/signIn.dto';
import { AuthService } from './auth.service';
import { NoAuth } from './decorator/NoAuth.decorator';
import { AUTH_SERVICE } from './constant';
import BoxAuthService from './box/BoxAuthService';
import ApiResponseDescription from '../common/swagger/response/ApiResponseDescription';
import { ModelName } from '../common/enum/modelName.enum';
import { NoBoxIdFilter } from '../box/auth/decorator/NoBoxIdFilter.decorator';
import { SignInResponseDto } from './dto/signInResponse.dto';
import { ApiBody } from '@nestjs/swagger';
import { RefreshTokenDto } from './dto/refreshToken.dto';
import { TokensDto } from './dto/tokens.dto';
import { Request, Response } from 'express';
import { TokenName } from './enum/tokenName.enum';
import { ClientType } from './enum/clientType.enum';
import { UniformResponse } from '../common/decorator/response/UniformResponse';

@NoAuth()
@Controller('auth')
export class AuthController {
  public constructor(
    @Inject(AUTH_SERVICE)
    private readonly authService: AuthService | BoxAuthService,
  ) {}

  /**
   * Log in to the system.
   *
   * If clientType is "web", tokens are sent as cookies, else as JSON.
   *
   * @param body - login credentials and optional clientType to determine call origin
   * @remarks After the profile with player was created, the user can log in to the system and get a JWT token to access resources.
   *
   * If the user provides the correct credentials, the access token will be returned, which should be used as a Bearer token in the Authorization header.
   */
  @ApiBody({ type: SignInDto })
  @ApiResponseDescription({
    success: {
      status: 201,
      modelName: ModelName.PROFILE,
      dto: SignInResponseDto,
    },
    errors: [400, 401],
    hasAuth: false,
  })
  @NoBoxIdFilter()
  @Post('/signIn')
  @UniformResponse(ModelName.PROFILE)
  public async signIn(
    @Body() body: SignInDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const [result, errors] = await this.authService.signIn(body.username, body.password);
    if (errors) return errors;

    if (body.clientType === ClientType.WEB) {
      const { accessToken, refreshToken, ...data } = result;

      this.authService.setCookies(
        response,
        accessToken,
        refreshToken,
        data.tokenExpires,
        data.refreshTokenExpires,
      );

      return data;
    }

    return result;
  }

  /**
   * Get new access and refresh tokens using refresh token from client.
   *
   * Browser sends refreshToken in Request, others in body.
   *
   * @param body - refresh token from client
   * @returns new access and refresh tokens
   */
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponseDescription({
    success: {
      status: 201,
      modelName: ModelName.PROFILE,
      dto: TokensDto,
    },
    errors: [400, 401],
    hasAuth: false,
  })
  @NoBoxIdFilter()
  @Post('/refresh')
  @UniformResponse(ModelName.PROFILE)
  public async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
    @Body() body?: RefreshTokenDto,
  ) {
    const refreshToken =
      body?.refreshToken ?? request.cookies[TokenName.REFRESH_TOKEN];

    const [result, errors] = await this.authService.refresh(refreshToken);
    if (errors) return errors;

    if (!body.refreshToken) {
      const { accessToken, refreshToken, ...data } = result;

      this.authService.setCookies(
        response,
        accessToken,
        refreshToken,
        data.tokenExpires,
        data.refreshTokenExpires,
      );

      return data;
    }

    return result;
  }

  /**
   * Log out of system.
   *
   * Revokes refresh token in DB. Clears cookies.
   *
   * @param request - Contains browser cookies
   * @param body - Optional body containig refresh token
   */
  @ApiResponseDescription({
    success: {
      status: 204,
    },
    errors: [400, 401],
    hasAuth: false,
  })
  @NoBoxIdFilter()
  @HttpCode(204)
  @Delete('/refresh')
  public async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
    @Body() body?: RefreshTokenDto,
  ) {
    const cookieToken = request.cookies[TokenName.REFRESH_TOKEN];
    const refreshToken = body?.refreshToken ?? cookieToken;

    const [, errors] = await this.authService.logout(refreshToken);
    if (errors) return [null, errors];

    if (cookieToken) this.authService.clearCookies(response);
  }
}
