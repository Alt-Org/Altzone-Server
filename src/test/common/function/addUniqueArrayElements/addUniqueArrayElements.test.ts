import { addUniqueArrayElements } from "../../../../common/function/addUniqueArrayElements";

describe('addUniqueArrayElements() test suite', () => {
    it('Should add unique elements to the array', () => {
        const arr = [1, 2, 3];
        const elems = [3, 4, 5];
        const result = addUniqueArrayElements(arr, elems);
        expect(result).toEqual([1, 2, 3, 4, 5]);
    });

    it('Should return the original array if elems is null', () => {
        const arr = [1, 2, 3];
        const result = addUniqueArrayElements(arr, null);
        expect(result).toEqual([1, 2, 3]);
    });

    it('Should return the original array if elems is empty', () => {
        const arr = [1, 2, 3];
        const elems: number[] = [];
        const result = addUniqueArrayElements(arr, elems);
        expect(result).toEqual([1, 2, 3]);
    });

    it('Should not add duplicate elements', () => {
        const arr = [1, 2, 3];
        const elems = [1, 2];
        const result = addUniqueArrayElements(arr, elems);
        expect(result).toEqual([1, 2, 3]);
    });
});