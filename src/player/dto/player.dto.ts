import {Expose, Type} from "class-transformer";
import {ClanDto} from "../../clan/dto/clan.dto";
import {ExtractField} from "../../common/decorator/response/ExtractField";
import {CustomCharacterDto} from "../../customCharacter/dto/customCharacter.dto";
import AddType from "../../common/base/decorator/AddType.decorator";

@AddType('PlayerDto')
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

    @Expose()
    above13: boolean;

    @Expose()
    parentalAuth: boolean | null;

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