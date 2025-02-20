import {AuthService} from "../../../auth/auth.service";
import AuthCommonModule from "./authCommonModule";
import {AuthGuard} from "../../../auth/auth.guard";
import BoxAuthService from "../../../auth/box/BoxAuthService";

export default class AuthModule {
    private constructor() {
    }

    static async getAuthService() {
        const module = await AuthCommonModule.getModule();
        return module.resolve(AuthService);
    }

    static async getAuthGuard() {
        const module = await AuthCommonModule.getModule();
        return module.resolve(AuthGuard);
    }

    static async getBoxAuthService() {
        const module = await AuthCommonModule.getModule();
        return module.resolve(BoxAuthService);
    }
}
