import {applyDecorators} from '@nestjs/common';
import {IClass} from "../../interface/IClass";
import {ThrowResponseErrorIfFound} from "../../decorator/response/ThrowResponseErrorIfFound";
import {Serialize} from "../../interceptor/response/Serialize";
import {ResponseType} from "../../decorator/response/responseType";
import {ModelName} from "../../enum/modelName.enum";
import {APIObjectName} from "../../enum/apiObjectName.enum";

/**
 * @deprecated 
 */
export const BasicGET = (modelName: ModelName | APIObjectName, responseDTO: IClass) => {
    return applyDecorators(
        ThrowResponseErrorIfFound(ResponseType.READ, modelName)
    );
}