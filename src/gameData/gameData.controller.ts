import { Body, Controller, ForbiddenException, HttpException, Post } from '@nestjs/common';
import { BattleResultDto } from './dto/battleResult.dto';
import { GameDataService } from './gameData.service';
import { LoggedUser } from '../common/decorator/param/LoggedUser.decorator';
import { User } from '../auth/user';
import { UniformResponse } from '../common/decorator/response/UniformResponse';

@Controller('gameData')
export class GameDataController {
	constructor(
		private readonly service: GameDataService,
	){}

	@Post('battle')
	@UniformResponse()
	async handleBattleResult(@Body() body: BattleResultDto, @LoggedUser() user: User) {
		return await this.service.handleBattleResult(body, user)
	} 
}
