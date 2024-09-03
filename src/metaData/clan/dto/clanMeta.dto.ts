import {Expose} from "class-transformer";
import { ExtractField } from "../../../common/decorator/response/ExtractField";

export class ClanMetaDto {
    @ExtractField()
    @Expose()
    _id: string;

    @Expose()
    playerCount: number;

    @Expose()
    furnitureCount: number;

    @Expose()
    raidRoomCount: number;
}