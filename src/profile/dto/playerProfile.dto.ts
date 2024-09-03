import AddType from "../../common/base/decorator/AddType.decorator";
import {CreatePlayerDto} from "../../player/dto/createPlayer.dto";
import {IsProfileExists} from "../decorator/validation/IsProfileExists.decorator";
import {IsMongoId, IsOptional} from "class-validator";

@AddType('PlayerProfileDto')
export class PlayerProfileDto extends CreatePlayerDto{
    @IsProfileExists()
    @IsMongoId()
    @IsOptional()
    override profile_id: string;
}