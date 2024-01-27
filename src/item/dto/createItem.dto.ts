import {IsBoolean, IsInt, IsMongoId, IsString} from "class-validator";
import {IsClanExists} from "../../clan/decorator/validation/IsClanExists.decorator";

export class CreateItemDto {
    @IsString()
    name: string;

    @IsString()
    shape: string;

    @IsInt()
    weight: number;

    @IsString()
    material: string;

    @IsString()
    recycling: string;

    @IsString()
    unityKey: string;

    @IsString()
    filename: string;

    @IsInt()
    rowNumber: number;

    @IsInt()
    columnNumber: number;

    @IsBoolean()
    isInStock: boolean;

    @IsBoolean()
    isFurniture: boolean;

    @IsClanExists()
    @IsMongoId()
    clan_id: string;
}