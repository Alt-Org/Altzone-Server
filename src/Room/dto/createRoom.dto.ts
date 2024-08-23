import { IsBoolean, IsMongoId, IsNumber, IsOptional, IsString } from "class-validator";
import AddType from "../../common/base/decorator/AddType.decorator";

@AddType('CreateRoomDto')
export class CreateRoomDto {
    @IsString() 
    floorType: string;

    @IsString()
    wallType: string;

    @IsBoolean()
    @IsOptional()
    isActive: boolean;

    @IsBoolean()
    @IsOptional()
    hasLift: boolean;

    @IsNumber()
    @IsOptional()
    deactivationTimestamp: number;

    @IsNumber()
    cellCount: number;

    @IsMongoId()
    soulHome_id: string;
}