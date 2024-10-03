import { IsArray, IsDate, IsEnum, IsMongoId, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class GameDto {
	@IsMongoId()
	@IsNotEmpty()
	_id: string;
  
	@IsArray()
	@IsMongoId({ each: true })
	@IsNotEmpty()
	team1: string[];
  
	@IsArray()
	@IsMongoId({ each: true })
	@IsNotEmpty()
	team2: string[];
  
	@IsMongoId()
	@IsNotEmpty()
	team1Clan: string;
  
	@IsMongoId()
	@IsNotEmpty()
	team2Clan: string;
  
	@IsEnum([1, 2])
	@IsNotEmpty()
	winner: number;
  
	@IsDate()
	@Type(() => Date)
	@IsNotEmpty()
	startedAt: Date;
  
	@IsDate()
	@Type(() => Date)
	@IsNotEmpty()
	endedAt: Date;
  }