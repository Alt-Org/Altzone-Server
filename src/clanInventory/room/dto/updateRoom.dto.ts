import { IsBoolean, IsMongoId, IsNumber, IsOptional, IsString } from "class-validator";
import AddType from "../../../common/base/decorator/AddType.decorator";

@AddType('UpdateRoomDto')
export class UpdateRoomDto {
    @IsMongoId()
    _id: string;

    @IsString() 
    @IsOptional()
    floorType: string;

    @IsString()
    @IsOptional()
    wallType: string;

    @IsBoolean()
    @IsOptional()
    hasLift: boolean;

    @IsNumber()
    @IsOptional()
    cellCount: number;
}