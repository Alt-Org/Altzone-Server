import { ArrayNotEmpty, IsArray, ArrayMaxSize, IsEnum, IsBoolean, IsInt, IsMongoId, IsOptional, IsString, Validate } from 'class-validator';import {IsClanExists} from "../decorator/validation/IsClanExists.decorator";
import { IsPlayerExists } from "../../player/decorator/validation/IsPlayerExists.decorator";
import AddType from "../../common/base/decorator/AddType.decorator";
import { ClanLabel } from '../enum/clanLabel.enum';

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

    @IsArray()
    @ArrayMaxSize(5)
    @IsEnum(ClanLabel, { each: true })
    @IsOptional()
    labels: ClanLabel[];

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