import {CreatePlayerDto} from "../../player/dto/createPlayer.dto";
import {IsProfileExists} from "../decorator/validation/IsProfileExists.decorator";
import {IsMongoId, IsOptional} from "class-validator";

export class PlayerProfileDto extends CreatePlayerDto{
    @IsProfileExists()
    @IsMongoId()
    @IsOptional()
    override profile_id: string;
}