import SwaggerTags from '../../common/swagger/tags/SwaggerTags.decorator';
import { Controller, Get, Query, Req, Res } from '@nestjs/common';
import ApiResponseDescription from '../../common/swagger/response/ApiResponseDescription';
import { NoAuth } from '../../auth/decorator/NoAuth.decorator';
import { UniformResponse } from '../../common/decorator/response/UniformResponse';
import { APIError } from '../../common/controller/APIError';
import { APIErrorReason } from '../../common/controller/APIErrorReason';
import { Request, Response } from 'express';
import AccountClaimerService from './accountClaimer.service';
import ClaimedAccountDto from './dto/claimedAccount.dto';

@SwaggerTags('Box')
@Controller('/box/claim-account')
export class AccountClaimerController {
  constructor(private readonly accountService: AccountClaimerService) {}

  /**
   * Claim tester account.
   *
   * @remarks Tester can claim his/her account for the testing box.
   *
   * Notice that the tester should know the shared testers password in order to be able to clain the account.
   * This password is available after the group admin has started the session.
   *
   * Notice that the endpoint should be called only from browser, since a cookie should be added by the API
   */
  @ApiResponseDescription({
    success: {
      status: 200,
      type: ClaimedAccountDto,
    },
    errors: [400, 403, 404],
    hasAuth: false,
  })
  @NoAuth()
  @Get('claim-account')
  @UniformResponse(undefined, ClaimedAccountDto)
  async claimAccount(
    @Req() req: Request,
    @Res() res: Response,
    @Query('password') password: string,
  ) {
    const { accountClaimed } = req.cookies;
    if (accountClaimed)
      throw new APIError({
        reason: APIErrorReason.NOT_AUTHORIZED,
        message: 'Account already claimed from this device.',
      });

    const data = await this.accountService.claimAccount(password);
    res.cookie('accountClaimed', true, {
      httpOnly: false,
      maxAge: 15 * 60 * 1000,
    });
    return res.send(data);
  }
}
