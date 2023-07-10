import {Expose, Type} from "class-transformer";
import {ExtractField} from "../../common/decorator/response/ExtractField";
import {ClanDto} from "../../clan/dto/clan.dto";

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

    @ExtractField()
    @Expose()
    clan_id: string;

    @Type(() => ClanDto)
    @Expose()
    Clan: ClanDto;
}