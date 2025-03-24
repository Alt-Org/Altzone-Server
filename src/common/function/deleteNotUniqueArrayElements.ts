/**
 * Removes duplicate elements from the `arr` array, keeping only the first occurrence of each element.
 *
 * @template T The type of elements in the array.
 * @param arr The array from which duplicates will be removed. If null or empty, an empty array is returned.
 * @returns A new array containing only the unique elements from `arr`.
 */
export function deleteNotUniqueArrayElements<T = any>(arr: T[] | null): T[] {
  if (!arr || arr.length === 0) return [];

  const uniqueValues: T[] = [];
  for (let i = 0; i < arr.length; i++) {
    if (!uniqueValues.includes(arr[i])) uniqueValues.push(arr[i]);
  }

  return uniqueValues;
}
