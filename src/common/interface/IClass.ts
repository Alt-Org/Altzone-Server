/**
 * Interface representing a regular class in JS.
 *
 * Can be used for example if there is a need to check that 
 * a parameter provided into method is a class = has a constructor method
 */
export interface IClass {
    new (...args: any[]): {};
}