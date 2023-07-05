import {Expose} from "class-transformer";
import {ExtractField} from "../../common/decorator/response/ExtractField";

export class FurnitureDto {
    @ExtractField()
    @Expose()
    _id: string;

    @Expose()
    name: string;

    @Expose()
    shape: string;

    @Expose()
    weight: number;

    @Expose()
    material: string;

    @Expose()
    recycling: string;

    @Expose()
    unityKey: string;

    @Expose()
    filename: string;

    @Expose()
    clan_id: string;
}