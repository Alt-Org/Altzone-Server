import { ArrayNotEmpty, IsArray, IsMongoId, IsOptional, IsString } from "class-validator";
import AddType from "../../common/base/decorator/AddType.decorator";

@AddType('updateSoulHomeDto')
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