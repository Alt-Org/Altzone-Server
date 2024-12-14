import { Controller, Get, Param } from "@nestjs/common";
import { VotingService } from "./voting.service";
import { UniformResponse } from "../common/decorator/response/UniformResponse";
import { ModelName } from "../common/enum/modelName.enum";
import { _idDto } from "../common/dto/_id.dto";
import { LoggedUser } from "../common/decorator/param/LoggedUser.decorator";
import { User } from "../auth/user";
import { Serialize } from "../common/interceptor/response/Serialize";
import { VotingDto } from "./dto/voting.dto";
import { APIError } from "../common/controller/APIError";
import { APIErrorReason } from "../common/controller/APIErrorReason";

@Controller("voting")
export class VotingController {
	constructor(private readonly service: VotingService) {}

	@Get("/:_id")
	@Serialize(VotingDto)
	@UniformResponse(ModelName.VOTING)
	async getVoting(@Param() param: _idDto, @LoggedUser() user: User) {
		const voting = await this.service.getVoting(
			param._id,
			user.player_id
		);
		if (!voting) {
			return new APIError({
				reason: APIErrorReason.NOT_ALLOWED,
				message: "Logged in user has no permission to read this voting.",
			});
		}
		return voting;
	}
}
