import {IsInt, IsMongoId, IsString} from "class-validator";
import {IsClanExists} from "../../clan/decorator/validation/IsClanExists.decorator";

export class CreateFurnitureDto {
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

    @IsClanExists()
    @IsMongoId()
    clan_id: string;
}