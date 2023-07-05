import {Transform, TransformOptions} from "class-transformer";

export const ExtractField = (options: TransformOptions = {}): PropertyDecorator => {
    return Transform(({obj, key}) => (obj[key]), options);
}