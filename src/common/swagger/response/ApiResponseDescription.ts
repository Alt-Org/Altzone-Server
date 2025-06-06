import { applyDecorators } from '@nestjs/common';
import {
  ApiStandardErrors,
  SupportedErrorCode,
} from './errors/ApiStandardErrors.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
import {
  ApiSuccessResponse,
  ApiSuccessResponseOptions,
} from './success/ApiSuccessResponse.decorator';
import { Type } from '@nestjs/common/interfaces';

/**
 * Options for describing an endpoint.
 */
type ApiDescriptionOptions = {
  /**
   * description information of successful response
   */
  success: {
    /**
     * The class of the DTO returned in the `data` field
     */
    dto?: Type;
  } & ApiSuccessResponseOptions;
  /**
   * possible errors that may occur on the endpoint
   * @default []
   */
  errors?: SupportedErrorCode[];
  /**
   * does endpoint have authentication requirement or not
   * @default true
   */
  hasAuth?: boolean;
};

/**
 * Adds swagger description for an endpoint.
 *
 * Notice that it is a helper decorator combining 3: `ApiSuccessResponse`, `ApiStandardErrors` and `ApiBearerAuth`.
 */
export default function ApiResponseDescription({
  success,
  errors = [],
  hasAuth = true,
}: ApiDescriptionOptions) {
  const { dto, ...successOptions } = success;

  const decoratorsToApply = [
    ApiSuccessResponse(dto, successOptions),
    ApiStandardErrors(...errors),
  ];
  if (hasAuth) decoratorsToApply.push(ApiBearerAuth());

  return applyDecorators(...decoratorsToApply);
}
