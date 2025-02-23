import {AuthService} from "../../../auth/auth.service";
import AuthCommonModule from "./authCommonModule";
import {AuthGuard} from "../../../auth/auth.guard";

export default class AuthModule {
    private constructor() {}

    static async getAuthService(): Promise<AuthService> {
        const module = await AuthCommonModule.getModule();
        return await module.resolve(AuthService);
    }

    static async getAuthGuard(): Promise<AuthGuard> {
        const module = await AuthCommonModule.getModule();
        return await module.resolve(AuthGuard);
    }
}