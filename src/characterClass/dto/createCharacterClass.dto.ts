import {IsEnum, IsInt, IsString} from "class-validator";
import {GestaltCycle} from "../../common/enum/gestaltCycle.enum";

export class CreateCharacterClassDto {
    @IsString()
    name: string;

    @IsEnum(GestaltCycle)
    gestaltCycle: GestaltCycle;

    @IsInt()
    speed: number;

    @IsInt()
    resistance: number;

    @IsInt()
    attack: number;

    @IsInt()
    defence: number;
}