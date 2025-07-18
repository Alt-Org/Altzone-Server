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

/**
 * Generates two random clan names.
 *
 * Each clan name is composed of a randomly selected Finnish adjective and noun,
 * followed by a random numeric suffix between 1 and 1000. If the resulting name
 * exceeds 20 characters, it is truncated to fit the limit.
 *
 * @returns array containing two generated clan names.
 */
export function generateDefaultClanNames(): string[] {
  const finnishAdjectives = [
    'Voimakkaat',
    'Nopeat',
    'Viisaat',
    'Urheat',
    'Vahvat',
    'Ketterät',
    'Rohkeat',
    'Sitkeät',
  ];
  const finnishNouns = [
    'Karhut',
    'Sudet',
    'Kotkat',
    'Hirvet',
    'Ilvekset',
    'Ketut',
    'Rusakot',
    'Haukat',
  ];
  const names: string[] = [];
  for (let i = 0; i < 2; i++) {
    const adjective =
      finnishAdjectives[Math.floor(Math.random() * finnishAdjectives.length)];
    const noun = finnishNouns[Math.floor(Math.random() * finnishNouns.length)];
    const suffix = Math.floor(Math.random() * 1000) + 1;
    let name = `${adjective}${noun}${suffix}`;
    if (name.length > 20) {
      name = name.slice(0, 20);
    }
    names.push(name);
  }
  return names;
}
