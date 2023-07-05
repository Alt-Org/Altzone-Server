import {Expose} from "class-transformer";
import {ExtractField} from "../../common/decorator/response/ExtractField";

export class CustomCharacterDto {
    @ExtractField()
    @Expose()
    _id: string;

    @Expose()
    unityKey: string;

    @Expose()
    name: string;

    @Expose()
    speed: number;

    @Expose()
    resistance: number;

    @Expose()
    attack: number;

    @Expose()
    defence: number;

    @Expose()
    characterClass_id: string;

    @Expose()
    player_id: string;
}