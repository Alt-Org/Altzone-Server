/**
 * Calculates the time elapsed since a given timestamp.
 *
 * @param timeStamp The timestamp (in milliseconds) from which to calculate the elapsed time.
 * @returns The time elapsed since the given timestamp, in milliseconds.
 */
export function getTimeSince(timeStamp: number) {
  const date = Date.now();
  return date - timeStamp;
}

/**
 * Checks if a specified amount of time has passed since a given timestamp.
 *
 * @param timeStamp The timestamp (in milliseconds) from which to start counting.
 * @param ms The amount of time, in milliseconds, to check against.
 * @returns `true` if the specified amount of time has passed since the timestamp, otherwise `false`.
 */
export function passed(timeStamp: number, ms: number) {
  const date = Date.now();
  return date - timeStamp >= ms;
}
