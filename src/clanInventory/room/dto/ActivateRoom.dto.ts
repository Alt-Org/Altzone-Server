import { IsMongoId, IsNumber, IsOptional } from "class-validator";
import AddType from "../../../common/base/decorator/AddType.decorator";

@AddType('ActivateRoomDto')
export class ActivateRoomDto {
    @IsMongoId({each: true}) 
    room_ids: string[];

    @IsNumber()
    @IsOptional()
    durationS: number;
}