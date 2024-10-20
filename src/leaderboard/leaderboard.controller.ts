import { Controller, Get } from "@nestjs/common";
import { LeaderboardService } from "./leaderboard.service";
import { UniformResponse } from "../common/decorator/response/UniformResponse";
import { ModelName } from "../common/enum/modelName.enum";
import { IGetAllQuery } from "../common/interface/IGetAllQuery";
import { GetAllQuery } from "../common/decorator/param/GetAllQuery";
import { OffsetPaginate } from "../common/interceptor/request/offsetPagination.interceptor";
import { Serialize } from "../common/interceptor/response/Serialize";
import { PlayerDto } from "../player/dto/player.dto";
import { ClanDto } from "../clan/dto/clan.dto";

@Controller("leaderboard")
export class LeaderboardController {
	constructor(private readonly leaderBoardService: LeaderboardService) {}

	@Get("player")
    @OffsetPaginate(ModelName.PLAYER)
    @Serialize(PlayerDto)
    @UniformResponse(ModelName.PLAYER)
	async getPlayerLeaderboard(@GetAllQuery() query: IGetAllQuery) {
		return await this.leaderBoardService.getPlayerLeaderboard(query);
	}

	@Get("clan")
	@OffsetPaginate(ModelName.CLAN)
	@Serialize(ClanDto)
	@UniformResponse(ModelName.CLAN)
	async getClanLeaderboard(@GetAllQuery() query: IGetAllQuery) {
		return await this.leaderBoardService.getClanLeaderboard(query);
	}
}
