import { Body, Controller, ForbiddenException, HttpException, Post } from '@nestjs/common';
import { BattleResultDto } from './dto/battleResult.dto';
import { GameDataService } from './gameData.service';
import { LoggedUser } from '../common/decorator/param/LoggedUser.decorator';
import { User } from '../auth/user';
import { UniformResponse } from '../common/decorator/response/UniformResponse';
import { APIError } from '../common/controller/APIError';
import { APIErrorReason } from '../common/controller/APIErrorReason';

@Controller('gameData')
export class GameDataController {
	constructor(
		private readonly service: GameDataService,
	){}

	@Post('battle')
	@UniformResponse()
	async handleBattleResult(@Body() body: BattleResultDto, @LoggedUser() user: User) {
		const currentTime = new Date();
		const winningTeam = body.winnerTeam === 1 ? body.team1 : body.team2;
		const playerInWinningTeam = winningTeam.includes(user.player_id);
		if (!playerInWinningTeam)
			return new APIError({ reason: APIErrorReason.NOT_AUTHORIZED });

		const [teamIds, teamIdsErrors] = await this.service.getClanIdForTeams([body.team1[0], body.team2[0]]);
		if (teamIdsErrors)
			return teamIdsErrors

		await this.service.createGameIfNotExists(body, teamIds, currentTime);
		
		return await this.service.generateResponse(body, teamIds.team1Id, teamIds.team2Id, user)
	} 
}
