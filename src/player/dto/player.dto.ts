import {Expose, Type} from "class-transformer";
import {ExtractField} from "../../decorator/ExtractField";
import {ClanDto} from "../../clan/dto/clan.dto";

export class PlayerDto {
    @ExtractField()
    @Expose()
    _id: string;

    @Expose()
    name: string;

    @Expose()
    backpackCapacity: number;

    @Expose()
    uniqueIdentifier: string;

    @ExtractField()
    @Expose()
    clan_id: string;

    @Type(() => ClanDto)
    @Expose()
    Clan: ClanDto;
}