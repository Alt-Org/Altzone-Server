import { Body, Controller, Post, UseGuards, Request } from '@nestjs/common';
import { BattleService } from './battle.service';
import { StartBattleDto } from './dto/startBattle.dto';
import { BattleResultDto } from './dto/battleResult.dto';
import { AuthGuard } from '../../auth/auth.guard';

@Controller('gamedata/battle')
@UseGuards(AuthGuard)
export class BattleController {
  constructor(private readonly battleService: BattleService) {}

  @Post('start')
  async startBattle(@Body() startBattleDto: StartBattleDto) {
    return this.battleService.registerBattle(startBattleDto);
  }

  @Post('result')
  async submitResult(
    @Request() req, 
    @Body() battleResultDto: BattleResultDto
  ) {
    const playerId = req.user.playerId; 
    return this.battleService.handleBattleResult(battleResultDto, playerId);
  }
}