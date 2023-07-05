import {IsEnum, IsInt, IsMongoId, IsOptional, IsString} from "class-validator";
import {GestaltCycle} from "../../common/enum/gestaltCycle.enum";
import {IsCharacterClassExists} from "../decorator/validation/IsCharacterClassExists.decorator";

export class UpdateCharacterClassDto {
    @IsCharacterClassExists()
    @IsMongoId()
    _id: string;

    @IsString()
    @IsOptional()
    name: string;

    @IsEnum(GestaltCycle)
    @IsOptional()
    gestaltCycle: GestaltCycle;

    @IsInt()
    @IsOptional()
    speed: number;

    @IsInt()
    @IsOptional()
    resistance: number;

    @IsInt()
    @IsOptional()
    attack: number;

    @IsInt()
    @IsOptional()
    defence: number;
}