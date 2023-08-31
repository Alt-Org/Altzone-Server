export function addUniqueArrayElements<T=any>(arr: T[], elems: T[] | null): T[] {
    if(!elems || elems.length === 0)
        return arr;

    const uniqueValues = elems.filter(value => !arr.includes(value));
    return [...arr, ...uniqueValues];
}