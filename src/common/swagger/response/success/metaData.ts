/**
 * Generates swagger schema definition for objects metadata.
 * @param modelName `modelName` example value, if not specified 'Object' will be set
 * @param dataKey `dataKey` example value, if not specified the model name will be set
 *
 * @returns swagger schema definition that can be set for the `metaData` field
 */
export function getObjectMetaDataSchema(
  modelName = 'Object',
  dataKey = modelName,
) {
  return {
    type: 'object',
    properties: {
      dataKey: {
        type: 'string',
        example: dataKey,
      },
      modelName: {
        type: 'string',
        example: modelName,
      },
      dataType: {
        type: 'string',
        example: 'Object',
      },
      dataCount: {
        type: 'integer',
        example: 1,
      },
    },
  };
}

/**
 * Generates swagger schema definition for arrays metadata.
 * @param modelName `modelName` example value, if not specified 'Object' will be set
 * @param dataKey `dataKey` example value, if not specified the model name will be set
 *
 * @returns swagger schema definition that can be set for the `metaData` field
 */
export function getArrayMetaDataSchema(
  modelName = 'Object',
  dataKey = modelName,
) {
  return {
    type: 'object',
    properties: {
      dataKey: {
        type: 'string',
        example: dataKey,
      },
      modelName: {
        type: 'string',
        example: modelName,
      },
      dataType: {
        type: 'string',
        example: 'Array',
      },
      dataCount: {
        type: 'number',
        example: 3,
      },
    },
  };
}
