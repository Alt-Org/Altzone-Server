export function deleteNotUniqueArrayElements<T=any>(arr: T[] | null): T[] {
    if(!arr || arr.length === 0)
        return [];

    const uniqueValues: T[] = [];
    for(let i=0; i<arr.length; i++){
        if(!uniqueValues.includes(arr[i]))
            uniqueValues.push(arr[i]);
    }

    return uniqueValues;
}