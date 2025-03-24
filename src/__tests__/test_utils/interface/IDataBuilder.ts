/**
 * Interface for test data builders
 */
export default interface IDataBuilder<T> {
  /**
   * Creates a new object with
   * set earlier in the chain values
   * and all other predefined values in the builder class
   */
  build(): T;
}
