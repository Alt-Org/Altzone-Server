import ICounter from './ICounter';

/**
 * Factory for creating ICounter instances
 */
export default interface ICounterFactory {
  /**
   * Create a counter
   * @returns
   */
  create: () => ICounter;
}
