import {ArrayNotEmpty, IsArray, IsBoolean, IsInt, IsMongoId, IsOptional, IsString, Validate} from "class-validator";
import {IsClanExists} from "../decorator/validation/IsClanExists.decorator";
import { IsPlayerExists } from "../../player/decorator/validation/IsPlayerExists.decorator";
import AddType from "../../common/base/decorator/AddType.decorator";

@AddType('UpdateClanDto')
export class UpdateClanDto {
    @IsClanExists()
    @IsMongoId()
    _id: string;

    @IsString()
    @IsOptional()
    name: string;

    @IsString()
    @IsOptional()
    tag: string;

    @IsInt()
    @IsOptional()
    gameCoins: number;

    //TODO: validate is player exists does not work
    @IsArray()
    @ArrayNotEmpty()
    @Validate(IsPlayerExists)
    @IsOptional()
    admin_idsToAdd: string[];

    @IsArray()
    @ArrayNotEmpty()
    @IsOptional()
    admin_idsToDelete: string[];


    @IsBoolean()
    @IsOptional()
    isOpen : boolean;



}