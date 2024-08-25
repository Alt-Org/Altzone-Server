/**
 * Removes elements from `arr` that are present in the `elems` array.
 *
 * @template T The type of elements in the arrays.
 * @param arr The original array from which elements will be removed.
 * @param elems The array containing elements to remove. If null or empty, `arr` is returned unchanged.
 * @returns A new array with the elements from `elems` removed from `arr`.
 */
export function deleteArrayElements<T=any>(arr: T[], elems: T[] | null): T[] {
    if(!elems || elems.length === 0)
        return arr
    return arr.filter(value => !elems.includes(value));
}