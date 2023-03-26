export const swapKeysAndValues = (objectToSwap: Record<any, any>): Record<string, string> => {
    const result: any = {};
    Object.entries(objectToSwap).forEach(([key, value]) => {
        result[value] = key;
    });

    return result;
}