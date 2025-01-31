import {Expose, Type} from "class-transformer";
import {ClanDto} from "../../clan/dto/clan.dto";
import {ExtractField} from "../../common/decorator/response/ExtractField";
import {CustomCharacterDto} from "../../customCharacter/dto/customCharacter.dto";
import AddType from "../../common/base/decorator/AddType.decorator";
import { GameStatisticsDto } from "./gameStatistics.dto";
import {ArrayMaxSize, IsArray, IsInt, IsMongoId, IsOptional} from "class-validator";

@AddType('PlayerDto')
export class PlayerDto {
    @ExtractField()
    @Expose()
    _id: string;

    @Expose()
    name: string;

    @Expose()
    points: number;

    @Expose()
    backpackCapacity: number;

    @Expose()
    uniqueIdentifier: string;

    @Expose()
    above13?: boolean | null;

    @Expose()
    parentalAuth: boolean | null;

    @Type(() => GameStatisticsDto)
    @Expose()
    gameStatistics: GameStatisticsDto;

    @Expose()
    battleCharacter_ids?: string[];

    @Expose()
    currentAvatarId?: number;

    @ExtractField()
    @Expose()
    profile_id: string;

    @ExtractField()
    @Expose()
    clan_id: string;

    @Type(() => ClanDto)
    @Expose()
    Clan: ClanDto;

    @Type(() => CustomCharacterDto)
    @Expose()
    CustomCharacter: CustomCharacterDto[];
}