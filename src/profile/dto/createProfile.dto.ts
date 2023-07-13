import {IsString} from "class-validator";

export class CreateProfileDto {
    @IsString()
    username: string;

    @IsString()
    password: string;
}