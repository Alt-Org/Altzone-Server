import { deleteNotUniqueArrayElements } from '../../../../common/function/deleteNotUniqueArrayElements';

describe('deleteNotUniqueArrayElements() test suite', () => {
  it('Should remove duplicates and keep the first occurrence', () => {
    const arr = [1, 2, 2, 3, 1];
    const result = deleteNotUniqueArrayElements(arr);
    expect(result).toEqual([1, 2, 3]);
  });

  it('Should return an empty array if the input array is null', () => {
    const result = deleteNotUniqueArrayElements(null);
    expect(result).toEqual([]);
  });

  it('Should return an empty array if the input array is empty', () => {
    const arr: number[] = [];
    const result = deleteNotUniqueArrayElements(arr);
    expect(result).toEqual([]);
  });

  it('Should return the same array if no duplicates exist', () => {
    const arr = [1, 2, 3];
    const result = deleteNotUniqueArrayElements(arr);
    expect(result).toEqual([1, 2, 3]);
  });
});
