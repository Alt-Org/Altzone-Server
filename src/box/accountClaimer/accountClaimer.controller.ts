import SwaggerTags from '../../common/swagger/tags/SwaggerTags.decorator';
import { Body, Controller, Post } from '@nestjs/common';
import ApiResponseDescription from '../../common/swagger/response/ApiResponseDescription';
import { NoAuth } from '../../auth/decorator/NoAuth.decorator';
import { UniformResponse } from '../../common/decorator/response/UniformResponse';
import AccountClaimerService from './accountClaimer.service';
import ClaimedAccountDto from './dto/claimedAccount.dto';
import ClaimAccountDto from './dto/claimAccount.dto';
import { ModelName } from '../../common/enum/modelName.enum';
import { NoBoxIdFilter } from '../auth/decorator/NoBoxIdFilter.decorator';

@SwaggerTags('Box')
@Controller('/box/claim-account')
export class AccountClaimerController {
  constructor(private readonly accountService: AccountClaimerService) {}

  /**
   * Claim tester account.
   *
   * @remarks Tester can claim his/her account for the testing box.
   *
   * Notice that the tester should know the shared testers password in order to be able to claim the account.
   * This password is available after the group admin has started the session.
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
  @Post()
  @NoBoxIdFilter()
  @UniformResponse(ModelName.PLAYER, ClaimedAccountDto)
  async claimAccount(@Body() body: ClaimAccountDto) {
    return this.accountService.claimAccount(body.sharedPassword);
  }
}
