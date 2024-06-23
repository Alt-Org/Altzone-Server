import { Expose } from "class-transformer";
import AddType from "src/common/base/decorator/AddType.decorator";
import { ExtractField } from "src/common/decorator/response/ExtractField";

@AddType('SoulHomeDto')
export class SoulHomeDto {
    @ExtractField()
    @Expose()
    _id: string;
    
    @Expose()
    type:string;

    @Expose()
    clan_id:string;
    
    @Expose()
    rooms:Array<string>;

}