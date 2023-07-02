import {IsMongoId} from "class-validator";

export class _idDto {
    @IsMongoId()
    _id: string;
}