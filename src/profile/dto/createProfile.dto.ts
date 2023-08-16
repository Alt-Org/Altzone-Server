import {IsOptional, IsString} from "class-validator";
import {CreatePlayerDto} from "../../player/dto/createPlayer.dto";

export class CreateProfileDto {
    @IsString()
    username: string;

    @IsString()
    password: string;

    @IsOptional()
    Player: CreatePlayerDto;
}