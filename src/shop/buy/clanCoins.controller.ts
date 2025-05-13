import {
  Body,
    Controller,
    HttpCode,
    Post,
  } from '@nestjs/common';

import { LoggedUser } from '../../common/decorator/param/LoggedUser.decorator';
import { ClanCoinsDto } from './dto/clanCoins.dto';
import { User } from '../../auth/user';
import DetermineClanId from '../../common/guard/clanId.guard';

@Controller('clanCoins')
export class ClanCoinsController {
    public constructor() {}
    
  @Post()
  @HttpCode(204)
  @DetermineClanId()
  //@Authorize({ action: Action.create, subject: ClanCoinsDto })
  public async create(@Body() body: ClanCoinsDto, @LoggedUser() user: User) {
        // eslint-disable-next-line no-console
        console.log('ClanCoinsController.create', body, user);
       return null; // Implement your logic here
     }
    }