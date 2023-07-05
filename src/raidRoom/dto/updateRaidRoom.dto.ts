import {IsEnum, IsInt, IsMongoId, IsOptional} from "class-validator";
import {IsPlayerExists} from "../../player/decorator/validation/IsPlayerExists.decorator";
import {IsClanExists} from "../../clan/decorator/validation/IsClanExists.decorator";
import {RaidRoom} from "../../common/enum/raidRoom.enum";
import {IsRaidRoomExists} from "../decorator/validation/IsRaidRoomExists.decorator";

export class UpdateRaidRoomDto {
    @IsRaidRoomExists()
    @IsMongoId()
    _id: string;

    @IsEnum(RaidRoom)
    @IsOptional()
    type: RaidRoom;

    @IsInt()
    @IsOptional()
    rowCount: number;

    @IsInt()
    @IsOptional()
    colCount: number;

    @IsPlayerExists()
    @IsMongoId()
    @IsOptional()
    player_id: string;

    @IsClanExists()
    @IsMongoId()
    @IsOptional()
    clan_id: string;
}