import {applyDecorators} from '@nestjs/common';
import {IClass} from "../../interface/IClass";
import {CatchCreateUpdateErrors} from "../../decorator/response/CatchCreateUpdateErrors";

/**
 * @deprecated 
 */
export function BasicPOST(_responseDTO: IClass) {
    return applyDecorators(
        CatchCreateUpdateErrors()
    );
}