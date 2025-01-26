import {StealTokenGuard} from "../../../../../clanInventory/item/guards/StealToken.guard";
import AuthModule from "../../../../auth/modules/auth.module";
import {AuthService} from "../../../../../auth/auth.service";
import TestUtilDataFactory from "../../../../test_utils/data/TestUtilsDataFactory";
import {APIError} from "../../../../../common/controller/APIError";
import {APIErrorReason} from "../../../../../common/controller/APIErrorReason";
import {UnauthorizedException} from "@nestjs/common";

describe('StealTokenGuard.canActivate() test suite', () => {
    let stealGuard: StealTokenGuard;
    let authService: AuthService;
    const mockAuthService = {
        verifyToken: jest.fn(),
    } as any;

    const contextBuilder = TestUtilDataFactory.getBuilder('ExecutionContext');

    beforeEach(async () => {
        authService = await AuthModule.getAuthService();
        stealGuard = new StealTokenGuard(authService);
    });

    it('Should return true if the steal token is valid', async () => {
        stealGuard = new StealTokenGuard(mockAuthService);
        jest.spyOn(mockAuthService, 'verifyToken').mockResolvedValue('token-verified');
        const context = contextBuilder.setHttpRequest({ body: {steal_token: 'valid-token'}, query: {} }).build();

        const canPass = await stealGuard.canActivate(context);

        expect(canPass).toBeTruthy();
    });

    it('Should attach valid and decoded steal token to the request object', async () => {
        stealGuard = new StealTokenGuard(mockAuthService);
        const decodedToken = 'token-verified';
        jest.spyOn(mockAuthService, 'verifyToken').mockResolvedValue(decodedToken);
        const context = contextBuilder.setHttpRequest({ body: {steal_token: 'valid-token'}, query: {} }).build();
        await stealGuard.canActivate(context);

        const request = context.switchToHttp().getRequest();
        expect(request.steal_token).toBe(decodedToken);
    });

    it('Should throw NOT_AUTHORIZED APIError if the steal token is not provided', async () => {
        const queryWithNoToken = { query: { steal_token: undefined }};
        const bodyWithNoToken = { body: { steal_token: undefined }};
        const context = contextBuilder.setHttpRequest({ ...queryWithNoToken, ...bodyWithNoToken }).build();

        const throwsNotAuthorized = async () => await stealGuard.canActivate(context);

        const expectedException = new APIError({ reason: APIErrorReason.NOT_AUTHORIZED, message: "steal_token is not provided" });
        await expect(throwsNotAuthorized).rejects.toThrow(expectedException);
    });

    it('Should throw UnauthorizedException if the steal token is not valid', async () => {
        const bodyWithInvalidToken = { body: { steal_token: 'invalid-steal-token' }, query: {}};
        const context = contextBuilder.setHttpRequest(bodyWithInvalidToken).build();

        const throwsNotAuthorized = async () => await stealGuard.canActivate(context);

        const expectedException = new UnauthorizedException({
            errors: [new APIError({reason: APIErrorReason.NOT_AUTHORIZED, message: 'Invalid token'})]
        });
        await expect(throwsNotAuthorized).rejects.toThrow(expectedException);
    });
});