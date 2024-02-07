import { ArrayNotEmpty, IsArray, IsBoolean, IsMongoId, IsOptional, IsString } from "class-validator";

export class UpdateRoomDto {
    @IsMongoId()
    _id:string;

    @IsString()
    @IsOptional()
    floorType:string;

    @IsString()
    @IsOptional()
    wallType:string;

    @IsBoolean()
    @IsOptional()
    isActive:boolean;

    @IsArray()
    @ArrayNotEmpty()
    @IsOptional()
    roomItemsToAdd:string[];

    @IsArray()
    @ArrayNotEmpty()
    @IsOptional()
    roomItemsToRemove:string[];

    @IsMongoId()
    @IsOptional()
    player_id:string;
    @IsMongoId()
    @IsOptional()
    soulhome_id:string;
}