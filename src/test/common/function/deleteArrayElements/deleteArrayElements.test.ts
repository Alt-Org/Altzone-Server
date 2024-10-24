import { deleteArrayElements } from "../../../../common/function/deleteArrayElements";

describe('deleteArrayElements() test suite', () => {
    it('Should remove elements from the array', () => {
        const arr = [1, 2, 3, 4];
        const elems = [2, 4];
        const result = deleteArrayElements(arr, elems);
        expect(result).toEqual([1, 3]);
    });

    it('Should return the original array if elems is null', () => {
        const arr = [1, 2, 3];
        const result = deleteArrayElements(arr, null);
        expect(result).toEqual([1, 2, 3]);
    });

    it('Should return the original array if elems is empty', () => {
        const arr = [1, 2, 3];
        const elems: number[] = [];
        const result = deleteArrayElements(arr, elems);
        expect(result).toEqual([1, 2, 3]);
    });

    it('Should return the original array if no elements are found to remove', () => {
        const arr = [1, 2, 3];
        const elems = [4, 5];
        const result = deleteArrayElements(arr, elems);
        expect(result).toEqual([1, 2, 3]);
    });
});