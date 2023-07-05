import {applyDecorators} from '@nestjs/common';
import {IClass} from "../../interface/IClass";
import {CatchCreateUpdateErrors} from "../../decorator/response/CatchCreateUpdateErrors";
import {Serialize} from "../../interceptor/response/Serialize";

export function BasicPOST(responseDTO: IClass) {
    return applyDecorators(
        CatchCreateUpdateErrors(),
        Serialize(responseDTO)
    );
}