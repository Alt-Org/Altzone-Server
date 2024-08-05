import { ModelName } from "../enum/modelName.enum";

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
export default function formatResponse(data: any, modelName: ModelName) {
    const dataType = Array.isArray(data) ? 'Array' : 'Object';
    const dataCount = dataType === 'Array' ? data.length : 1; 
    return {
        data: {
            [modelName]: data
        },
        metaData: {
            dataKey: modelName,
            modelName: modelName,
            dataType,
            dataCount
        }
    }
}