import { IsArray, IsDate, IsEnum, IsInt, IsMongoId, IsOptional } from "class-validator";
import AddType from "../../common/base/decorator/AddType.decorator";
import { VotingType } from "../enum/VotingType.enum";
import { Vote } from "../vote.schema";

@AddType("CreateVotingDto")
export class CreateVotingDto {
	@IsMongoId()
	organizer_id: string;

	@IsDate()
	@IsOptional()
	startedAt?: Date;

	@IsDate()
	@IsOptional()
	endsOn?: Date;

	@IsEnum(VotingType)
	type: string;

	@IsInt()
	@IsOptional()
	minPercentage?: number;

	@IsMongoId()
	@IsOptional()
	entity_id?: string;

	@IsArray()
	@IsMongoId({ each: true })
	@IsOptional()
	player_ids?: string[];

	@IsArray()
	@IsOptional()
	votes?: Vote[];
}
