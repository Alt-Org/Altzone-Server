import {Transform, TransformOptions} from "class-transformer";

/**
 * Extract field from an object during serialization.
 *
 * For example it can be used when there is a need to get a string value of a mongo _id field
 *
 * @example ```ts
 *  \@ExtractField() //ignore the '\' in the start
 *  clan_id: string;
 * ```
 *
 * @param options transformation options 
 * @returns 
 */
export const ExtractField = (options: TransformOptions = {}): PropertyDecorator => {
    return Transform(({obj, key}) => (obj[key]), options);
}