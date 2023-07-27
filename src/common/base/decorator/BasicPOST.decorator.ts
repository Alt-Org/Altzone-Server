import {applyDecorators} from '@nestjs/common';
import {IClass} from "../../interface/IClass";
import {CatchCreateUpdateErrors} from "../../decorator/response/CatchCreateUpdateErrors";

export function BasicPOST(responseDTO: IClass) {
    return applyDecorators(
        CatchCreateUpdateErrors()
    );
}