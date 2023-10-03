export type PreHookFunction<Input=any> = (input: Input) => boolean | Promise<boolean>;
export type PostHookFunction<Input=any, Output=any> = (input: Input, output: Output) => boolean | Promise<boolean>;
export type PostUpdateHookFunction<Input=any, OldDoc=any, Output=any> = (input: Input, oldDoc: OldDoc, output: Output) => boolean | Promise<boolean>;
export interface IHookImplementer<Input=any, Output=any> {
    createOnePreHook?: PreHookFunction<Input>;
    createOnePostHook?: PostHookFunction<Input, Output>;

    readOnePreHook?: PreHookFunction<Input>;
    readOnePostHook?: PostHookFunction<Input, Output>;

    readAllPreHook?: PreHookFunction<Input>;
    readAllPostHook?: PostHookFunction<Input, Output>;

    updateOnePreHook?: PreHookFunction<Input>;
    updateOnePostHook?: PostUpdateHookFunction<Input, Output>;

    deleteOnePreHook?: PreHookFunction<Input>;
    deleteOnePostHook?: PostHookFunction<Input, Output>;
}