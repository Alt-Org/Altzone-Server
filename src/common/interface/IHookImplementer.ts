export type PreHookFunction<Input = any> = (input: Input) => boolean | Promise<boolean>;
export type PostCreateHookFunction<Input = any, Output = any> = (input: Input, output: Output) => boolean | Promise<boolean>;
export type PostHookFunction<Input = any, OldDoc = any, Output = any> = (input: Input, oldDoc: OldDoc, output: Output) => boolean | Promise<boolean>;
export type PostReadOneHookFunction<Output = any> = (output: Output) => boolean | Promise<boolean>;
export type PostReadAllHookFunction<Output = any> = (output: Output) => boolean | Promise<boolean>;
//Commented methods are not in use yet in BasicService

/**
 * All the methods should return the result of the operation: true for success and false for any issues
 * @deprecated
*/
export interface IHookImplementer<Input = any, OldDoc = any, Output = any> {
    //createOnePreHook?: PreHookFunction<Input>;
    createOnePostHook?: PostCreateHookFunction<Input, Output>;

    // readOnePreHook?: PreHookFunction<Input>;
    readOnePostHook?: PostReadOneHookFunction<Output>;

    // readAllPreHook?: PreHookFunction<Input>;
    readAllPostHook?: PostReadAllHookFunction<Output>; 

    // updateOnePreHook?: PreHookFunction<Input>;
    updateOnePostHook?: PostHookFunction<Input, OldDoc, Output>;

    // deleteOnePreHook?: PreHookFunction<Input>;
    deleteOnePostHook?: PostHookFunction<Input, OldDoc, Output>;
}
