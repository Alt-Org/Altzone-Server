import {Expose} from "class-transformer";
import {ExtractField} from "../../common/decorator/response/ExtractField";
import {GestaltCycle} from "../../common/enum/gestaltCycle.enum";

export class CustomCharacterDto {
    @ExtractField()
    @Expose()
    _id: string;

    @Expose()
    name: string;

    @Expose()
    gestaltCycle: GestaltCycle;

    @Expose()
    speed: number;

    @Expose()
    resistance: number;

    @Expose()
    attack: number;

    @Expose()
    defence: number;
}