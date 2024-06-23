import {IsInt, IsMongoId, IsOptional, IsString} from "class-validator";
import AddType from "src/common/base/decorator/AddType.decorator";

@AddType('UpdateMessageDto')
export class UpdateMessageDto {
    @IsInt()
    id: number;

    @IsOptional()
    @IsString()
    content?: string;

    @IsOptional()
    @IsInt()
    feeling?: number;
}