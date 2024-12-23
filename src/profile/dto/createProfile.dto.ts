import {IsOptional, IsString, ValidateNested} from "class-validator";
import {CreatePlayerDto} from "../../player/dto/createPlayer.dto";
import {Type} from "class-transformer";
import AddType from "../../common/base/decorator/AddType.decorator";

@AddType('CreateProfileDto')
export class CreateProfileDto {
    @IsString()
    username: string;

    @IsString()
    password: string;

    @IsOptional()
    @ValidateNested()
    @Type(() => CreatePlayerDto)
    Player: CreatePlayerDto;
}