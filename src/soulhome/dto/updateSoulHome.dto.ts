import { ArrayNotEmpty, IsArray, IsMongoId, IsOptional, IsString } from "class-validator";

export class updateSoulHomeDto {
    @IsMongoId()
    _id: string;

    @IsString()
    @IsOptional()
    type:string;

    @IsArray()
    @ArrayNotEmpty()
    @IsOptional()
    addedRooms:string[];

    @IsArray()
    @ArrayNotEmpty()
    @IsOptional()
    removedRooms:string[];
}