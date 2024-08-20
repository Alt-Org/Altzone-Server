import {IsInt, IsMongoId, IsOptional} from "class-validator";
import {IsClanExists} from "../../clan/decorator/validation/IsClanExists.decorator";
import {IsStockExists} from "../decorator/validation/IsStockExists.decorator";
import AddType from "../../common/base/decorator/AddType.decorator";

@AddType('UpdateStockDto')
export class UpdateStockDto {
    @IsStockExists()
    @IsMongoId()
    _id: string;

    @IsInt()
    @IsOptional()
    cellCount: number;

    @IsClanExists()
    @IsMongoId()
    @IsOptional()
    clan_id: string;
}