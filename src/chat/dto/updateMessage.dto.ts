import {IsInt, IsMongoId, IsOptional, IsString} from "class-validator";

export class UpdateMessageDto {
    @IsString()
    _id: string;

    @IsOptional()
    @IsString()
    content?: string;

    @IsOptional()
    @IsInt()
    feeling?: number;
}