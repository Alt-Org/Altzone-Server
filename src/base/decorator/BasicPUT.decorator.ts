import {applyDecorators, HttpCode} from '@nestjs/common';
import {CatchCreateUpdateErrors} from "../../decorator/CatchCreateUpdateErrors";
import {ThrowResponseErrorIfFound} from "../../decorator/ThrowResponseErrorIfFound";
import {ResponseType} from "../../decorator/responseType";
import {ClassName} from "../../util/dictionary";

export function BasicPUT(modelName: ClassName) {
    return applyDecorators(
        HttpCode(204),
        CatchCreateUpdateErrors(),
        ThrowResponseErrorIfFound(ResponseType.UPDATE, modelName)
    );
}