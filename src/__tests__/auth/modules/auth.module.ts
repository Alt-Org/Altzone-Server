import {AuthService} from "../../../auth/auth.service";
import AuthCommonModule from "./authCommonModule";

export default class AuthModule {
    private constructor() {}

    static async getAuthService(): Promise<AuthService> {
        const module = await AuthCommonModule.getModule();
        return await module.resolve(AuthService);
    }
}