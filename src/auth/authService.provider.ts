import { Provider } from "@nestjs/common";
import {AuthService} from "./auth.service";
import {AUTH_SERVICE} from "./constant";
import isTestingSession from "../box/util/isTestingSession";
import BoxAuthService from "./box/BoxAuthService";

export const AuthServiceProvider: Provider = {
    provide: AUTH_SERVICE,
    useFactory: (boxAuthService: BoxAuthService, defaultAuthService: AuthService) => {
        return isTestingSession() ? boxAuthService : defaultAuthService;
    },
    inject: [BoxAuthService, AuthService]
};
