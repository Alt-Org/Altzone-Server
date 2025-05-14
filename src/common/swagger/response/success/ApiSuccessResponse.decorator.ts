import { applyDecorators, Type } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiResponse,
  ApiResponseOptions,
  getSchemaPath,
} from '@nestjs/swagger';
import { getArrayMetaDataSchema, getObjectMetaDataSchema } from './metaData';

/**
 * Additional options for configuring response swagger definition
 */
export type ApiSuccessResponseOptions = ApiResponseOptions & {
  /**
   * Indicates whether the returned `data` is an array of items.
   * If true, Swagger will document the response `data` field as an array of the specified DTO type.
   *
   * @default false
   */
  returnsArray?: boolean;

  /**
   * Model name to be used in the data and metadata section of the response.
   *
   * @default "Object"
   * @example "Clan"
   */
  modelName?: string;

  /**
   * Key name under the `data` object to wrap the returned value.
   * If not provided, the modelName is used as the default key.
   *
   * @example "Clan"
   */
  dataKey?: string;

  /**
   * When true, adds a `paginationData` object to the Swagger schema definition
   *
   * Notice that if `returnsArray` is set to true, `paginationData` default option will be set to true by default
   *
   * @default false
   */
  hasPagination?: boolean;
};

/**
 * Adds a Swagger success response with a wrapped `data` object containing the given DTO.
 *
 * Notice that it will add status code 200 and description "Operation is successful".
 * You can overwrite them in options.
 *
 * @param dto The class of the DTO returned in the `data` field
 * @param options additional options and swagger definition options, which can override any other response definitions
 */
export function ApiSuccessResponse(
  dto?: Type,
  options?: ApiSuccessResponseOptions,
) {
  if (!dto) {
    return applyDecorators(
      ApiResponse({
        description: 'Successful request, response with no body',
        ...options,
      }),
    );
  }

  const { returnsArray, modelName, dataKey, hasPagination } = options;

  const dataKeyField = dataKey ?? modelName ?? 'Object';

  const metaData = returnsArray
    ? getArrayMetaDataSchema(modelName, dataKey)
    : getObjectMetaDataSchema(modelName, dataKey);

  const addPaginationData =
    (returnsArray && hasPagination !== false) || hasPagination;

  const paginationData = addPaginationData
    ? {
        type: 'object',
        properties: {
          currentPage: { type: 'integer', example: 1 },
          limit: { type: 'integer', example: 20 },
          offset: { type: 'integer', example: 0 },
          itemCount: { type: 'integer', example: 5 },
          pageCount: { type: 'integer', example: 1 },
        },
      }
    : undefined;

  return applyDecorators(
    ApiExtraModels(dto),
    ApiResponse({
      schema: {
        type: 'object',
        properties: {
          data: {
            type: 'object',
            properties: {
              [dataKeyField]: returnsArray
                ? {
                    type: 'array',
                    items: { $ref: getSchemaPath(dto.name) },
                  }
                : {
                    $ref: getSchemaPath(dto.name),
                  },
            },
          },
          metaData,
          paginationData,
        },
      },

      status: 200,
      description: 'Operation is successful',
      ...options,
    }),
  );
}
