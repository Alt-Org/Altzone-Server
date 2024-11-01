import { IsMongoId, IsOptional, IsString } from "class-validator";
import { IsClanExists } from "../../../clan/decorator/validation/IsClanExists.decorator";
import AddType from "../../../../common/base/decorator/AddType.decorator";
import { IsPlayerExists } from "../../../../player/decorator/validation/IsPlayerExists.decorator";

@AddType('JoinRequestDto')
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