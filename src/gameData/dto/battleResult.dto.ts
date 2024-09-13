import { IsArray, IsInt, IsMongoId, IsPositive, IsString, Max, Min } from "class-validator";

export class BattleResultDto {
	@IsString()
	type: string;

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
