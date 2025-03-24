/**
 * Format the provided data to the uniform response form, which can be understood by all decorators in the pipe
 * @param data data to send
 * @param modelName model name of the data, for example if returning data is a Clan data the ModelName.CLAN should be specified
 * @example ```
 * const resp = formatResponse({name: 'My clan', coins: 2}, ModelName.CLAN);
 * console.log(resp); // {
 *                     // data: { Clan: {name: 'My clan', coins: 2},
 *                     // metaData: {dataKey: 'Clan', modelName: 'Clan', dataType: 'Object' }}
 *                     //}
 * ```
 * @returns formatted response object
 */
export default function formatResponse(data: any, modelName?: string) {
  const dataType = Array.isArray(data) ? 'Array' : 'Object';
  const model = modelName ?? 'Object';
  let dataCount: number;

  if (dataType === 'Object') {
    dataCount = 0;
    for (const key of Object.keys(data)) {
      if (Array.isArray(data[key])) {
        dataCount += data[key].length;
      }
    }
    if (dataCount === 0) dataCount++;
  } else {
    dataCount = data.length;
  }

  return {
    data: {
      [model]: data,
    },
    metaData: {
      dataKey: model,
      modelName: model,
      dataType,
      dataCount,
    },
  };
}
