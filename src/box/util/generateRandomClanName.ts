/**
 * Generates a random clan name.
 *
 * Clan name is composed of a randomly selected Finnish adjective and noun,
 *
 * @returns generated clan name.
 */
export function generateRandomClanName(): string {
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

  const adjective =
    finnishAdjectives[Math.floor(Math.random() * finnishAdjectives.length)];
  const noun = finnishNouns[Math.floor(Math.random() * finnishNouns.length)];
  return `${adjective}-${noun}`;
}
