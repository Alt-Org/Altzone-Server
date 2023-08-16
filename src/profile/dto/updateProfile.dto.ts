import {IsMongoId, IsOptional, IsString} from "class-validator";
import {IsProfileExists} from "../decorator/validation/IsProfileExists.decorator";

export class UpdateProfileDto {
    @IsProfileExists()
    @IsMongoId()
    _id: string;

    @IsString()
    @IsOptional()
    username: string;

    @IsString()
    @IsOptional()
    password: string;
}