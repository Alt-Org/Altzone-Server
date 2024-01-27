import {Expose, Type} from "class-transformer";
import {ClanDto} from "../../clan/dto/clan.dto";
import {ExtractField} from "../../common/decorator/response/ExtractField";
import {CustomCharacterDto} from "../../customCharacter/dto/customCharacter.dto";

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
    profile_id: string;

    @ExtractField()
    @Expose()
    clan_id: string;

    @ExtractField()
    @Expose()
    currentCustomCharacter_id: string;

    @Type(() => ClanDto)
    @Expose()
    Clan: ClanDto;

    @Type(() => CustomCharacterDto)
    @Expose()
    CustomCharacter: CustomCharacterDto[];
}