import { IsArray, IsEnum, IsInt, IsMongoId, IsPositive, Max, Min } from "class-validator";
import { RequestType } from "../enum/requestType.enum";

export class BattleResultDto {
	@IsEnum(RequestType)
	type: RequestType.RESULT;

	@IsArray()
	@IsMongoId({ each: true })
	team1: string[];
	
	@IsArray()
	@IsMongoId({ each: true })
	team2: string[];

	@IsInt()
	@IsPositive()
	duration: number;

	@IsInt()
	@Min(1)
	@Max(2)
	winnerTeam: number;
}