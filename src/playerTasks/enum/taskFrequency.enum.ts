/**
 * Enum used to represent the different task frequencies.
 *
 * This enum is used in various parts of the application, such as:
 * - When processing tasks in the service layer
 * - When returning task data to the client side
 *
 * Notice that whenever there is a need to specify a task frequency, this enum must be used instead of plain text.
 * @example ```ts
 * // Do not write it as plain text
 * const taskFrequency = 'daily';
 * // Use the enum instead
 * const taskFrequency = TaskFrequency.DAILY;
 * ```
 */
export enum TaskFrequency {
	DAILY = 'daily',
	WEEKLY = 'weekly',
	MONTHLY = 'monthly',
} 