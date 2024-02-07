import { Expose } from "class-transformer";
import { ExtractField } from "src/common/decorator/response/ExtractField";

export class SoulHomeDto {
    @ExtractField()
    @Expose()
    _id: string;
    
    @Expose()
    type:string;

    @Expose()
    clan_id:string;
}