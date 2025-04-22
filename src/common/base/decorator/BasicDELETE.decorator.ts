import { applyDecorators, HttpCode } from '@nestjs/common';
import { ThrowResponseErrorIfFound } from '../../decorator/response/ThrowResponseErrorIfFound';
import { ResponseType } from '../../decorator/response/responseType';
import { ModelName } from '../../enum/modelName.enum';

/**
 * @deprecated
 */
export function BasicDELETE(modelName: ModelName) {
  return applyDecorators(
    HttpCode(204),
    ThrowResponseErrorIfFound(ResponseType.DELETE, modelName),
  );
}
