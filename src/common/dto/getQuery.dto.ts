import {IsEmpty, IsNotEmpty, IsOptional} from "class-validator";

export class GetQueryDto {
    @IsOptional()
    @IsNotEmpty()
    with: string;

    @IsOptional()
    @IsEmpty()
    all: string;
}