import {IsInt, IsMongoId, IsOptional, IsString} from "class-validator";

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