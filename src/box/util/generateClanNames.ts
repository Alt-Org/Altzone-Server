/**
 * Generates clan names with specified unique value. For example:
 * uniqueValue = "john" => "john clan 1"
 * @param uniqueValue unique value to be used
 * @param nameCount amount of names to be generated
 *
 * @returns array of clan names
 */
export default function generateClanNames(
  uniqueValue: string,
  nameCount: number,
): string[] {
  const names: string[] = [];
  for (let i = 0; i < nameCount; i++)
    names.push(`${uniqueValue} clan ${i + 1}`);

  return names;
}
