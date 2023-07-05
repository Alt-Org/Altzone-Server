import {applyDecorators, HttpCode} from '@nestjs/common';
import {CatchCreateUpdateErrors} from "../../decorator/response/CatchCreateUpdateErrors";
import {ThrowResponseErrorIfFound} from "../../decorator/response/ThrowResponseErrorIfFound";
import {ResponseType} from "../../decorator/response/responseType";
import {ModelName} from "../../enum/modelName.enum";

export function BasicPUT(modelName: ModelName) {
    return applyDecorators(
        HttpCode(204),
        CatchCreateUpdateErrors(),
        ThrowResponseErrorIfFound(ResponseType.UPDATE, modelName)
    );
}