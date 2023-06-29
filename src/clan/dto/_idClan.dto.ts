import {IsMongoId} from "class-validator";

export class _idClanDto {
    @IsMongoId()
    _id: string;
}