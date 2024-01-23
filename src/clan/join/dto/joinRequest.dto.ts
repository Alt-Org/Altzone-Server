import { IsMongoId, IsOptional, IsString } from "class-validator";
import { IsClanExists } from "src/clan/decorator/validation/IsClanExists.decorator";

export class JoinRequestDto {
    
    @IsString()
    @IsMongoId()
    @IsClanExists()
    clan_id: string; // the clan id we are trying to join
    
    @IsString()
    player_id: string; // the player who is trying to join

    @IsString()
    @IsOptional()
    join_message: string; // join message if clan is private
}