export function deleteArrayElements<T=any>(arr: T[], elems: T[] | null): T[] {
    if(!elems || elems.length === 0)
        return arr
    return arr.filter(value => !elems.includes(value));
}