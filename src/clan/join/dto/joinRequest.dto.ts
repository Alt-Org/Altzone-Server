import { IsMongoId, IsOptional, IsString } from "class-validator";
import { IsClanExists } from "src/clan/decorator/validation/IsClanExists.decorator";
import { IsPlayerExists } from "src/player/decorator/validation/IsPlayerExists.decorator";

export class JoinRequestDto {
    @IsClanExists()
    @IsMongoId() 
    clan_id: string; // the clan id we are trying to join
    
    @IsPlayerExists()
    @IsMongoId()
    player_id: string; // the player who is trying to join

    @IsString()
    @IsOptional()
    join_message: string; // join message if clan is private
}