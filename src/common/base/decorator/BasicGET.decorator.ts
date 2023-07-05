import {applyDecorators} from '@nestjs/common';
import {IClass} from "../../interface/IClass";
import {ThrowResponseErrorIfFound} from "../../decorator/response/ThrowResponseErrorIfFound";
import {Serialize} from "../../interceptor/response/Serialize";
import {ResponseType} from "../../decorator/response/responseType";
import {ModelName} from "../../enum/modelName.enum";

export const BasicGET = (modelName: ModelName, responseDTO: IClass) => {
    return applyDecorators(
        ThrowResponseErrorIfFound(ResponseType.READ, modelName),
        Serialize(responseDTO)
    );
}