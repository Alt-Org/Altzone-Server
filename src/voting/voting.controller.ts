import { Body, Controller, Get, Param, Put } from "@nestjs/common";
import { VotingService } from "./voting.service";
import { UniformResponse } from "../common/decorator/response/UniformResponse";
import { ModelName } from "../common/enum/modelName.enum";
import { _idDto } from "../common/dto/_id.dto";
import { LoggedUser } from "../common/decorator/param/LoggedUser.decorator";
import { User } from "../auth/user";
import { Serialize } from "../common/interceptor/response/Serialize";
import { VotingDto } from "./dto/voting.dto";
import { AddVoteDto } from "./dto/addVote.dto";
import { noPermissionError } from "./error/noPermission.error";

@Controller("voting")
export class VotingController {
	constructor(private readonly service: VotingService) {}

	@Get()
	@Serialize(VotingDto)
	@UniformResponse(ModelName.VOTING)
	async getClanVotings(@LoggedUser() user: User) {
		return this.service.getClanVotings(user.player_id);
	}

	@Get("/:_id")
	@Serialize(VotingDto)
	@UniformResponse(ModelName.VOTING)
	async getVoting(@Param() param: _idDto, @LoggedUser() user: User) {
		const permission = await this.service.validatePermission(
			param._id,
			user.player_id
		);
		if (!permission) return noPermissionError;

		return await this.service.basicService.readOneById(param._id);
	}

	@Put()
	@UniformResponse()
	async addVote(@Body() body: AddVoteDto, @LoggedUser() user: User) {
		const permission = await this.service.validatePermission(
			body.voting_id,
			user.player_id
		);
		if (!permission) return noPermissionError;

		return this.service.addVote(body.voting_id, body.choice, user.player_id);
	}
}
