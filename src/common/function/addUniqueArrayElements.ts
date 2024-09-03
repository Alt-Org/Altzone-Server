/**
 * Adds unique elements from `elems` array to the `arr` array.
 * Elements that are already present in `arr` will not be added.
 *
 * @template T The type of elements in the arrays.
 * @param arr The original array to which unique elements will be added.
 * @param elems The array containing elements to add. If null or empty, `arr` is returned unchanged.
 * @returns A new array with the unique elements from `elems` added to `arr`.
 */
export function addUniqueArrayElements<T=any>(arr: T[], elems: T[] | null): T[] {
    if(!elems || elems.length === 0)
        return arr;

    const uniqueValues = elems.filter(value => !arr.includes(value));
    return [...arr, ...uniqueValues];
}