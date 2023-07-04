import {applyDecorators} from '@nestjs/common';
import {CatchCreateUpdateErrors} from "../../decorator/CatchCreateUpdateErrors";
import {Serialize} from "../../interceptor/Serialize";
import {IClass} from "../../util/interfaces/IClass";

export function BasicPOST(responseDTO: IClass) {
    return applyDecorators(
        CatchCreateUpdateErrors(),
        Serialize(responseDTO)
    );
}