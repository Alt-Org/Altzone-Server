import {applyDecorators} from '@nestjs/common';
import {ThrowResponseErrorIfFound} from "../../decorator/ThrowResponseErrorIfFound";
import {ResponseType} from "../../decorator/responseType";
import {ClassName} from "../../util/dictionary";
import {Serialize} from "../../interceptor/Serialize";
import {IClass} from "../../util/interfaces/IClass";

export const BasicGET = (modelName: ClassName, responseDTO: IClass) => {
    return applyDecorators(
        ThrowResponseErrorIfFound(ResponseType.READ, modelName),
        Serialize(responseDTO)
    );
}