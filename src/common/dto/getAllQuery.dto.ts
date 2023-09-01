import {IsNotEmpty, IsOptional} from "class-validator";

export class GetAllQueryDto {
    @IsOptional()
    @IsNotEmpty()
    search: string;
}