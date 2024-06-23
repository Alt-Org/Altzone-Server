import {IsOptional, IsString, ValidateNested} from "class-validator";
import {CreatePlayerDto} from "../../player/dto/createPlayer.dto";
import {Type} from "class-transformer";
import {PlayerProfileDto} from "./playerProfile.dto";
import AddType from "src/common/base/decorator/AddType.decorator";

@AddType('CreateProfileDto')
export class CreateProfileDto {
    @IsString()
    username: string;

    @IsString()
    password: string;

    @IsOptional()
    @ValidateNested()
    @Type(() => PlayerProfileDto)
    Player: PlayerProfileDto;
}