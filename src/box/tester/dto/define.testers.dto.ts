import {IsNumber, IsOptional, Max, Min} from "class-validator";

export default class DefineTestersDto {
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(99)
    amountToAdd: number;

    @IsOptional()
    @IsNumber()
    @Min(1)
    amountToRemove: number;
}
