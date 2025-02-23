import {AuthService} from "../../../auth/auth.service";
import AuthModule from "../modules/auth.module";
import {JwtService} from "@nestjs/jwt";
import {UnauthorizedException} from "@nestjs/common";
import {APIError} from "../../../common/controller/APIError";
import {APIErrorReason} from "../../../common/controller/APIErrorReason";

describe('AuthService.verifyToken() test suite', () => {
    const validToken = 'valid-token';
    const expiredToken = 'expired-token';
    const decodedToken = {token: 'decoded-token'};
    const tokenExpires = new Date().getTime();

    jest.spyOn(JwtService.prototype, 'verifyAsync').mockImplementation(async (token) => {
        if(token === validToken)
            return decodedToken;

        throw new Error('Invalid token');
    });
    jest.spyOn(JwtService.prototype, 'decode').mockImplementation((token) => {
        if(token === expiredToken)
            return {exp: 0};

        return {exp: tokenExpires};
    });

    let authService: AuthService;

    beforeEach(async () => {
        authService = await AuthModule.getAuthService();
    });

    it('Should return decoded token if provided token is valid', async () => {
        const result = await authService.verifyToken(validToken);
        expect(result).toEqual(decodedToken);
    });

    it('Should throw UnauthorizedException with APIError NOT_AUTHORIZED if provided token is invalid', async () => {
        const invalidToken = 'invalid-token';
        const invalidTokenCall = async () => await authService.verifyToken(invalidToken);

        const expectedError = new UnauthorizedException({
            statusCode: 403,
            errors: [new APIError({reason: APIErrorReason.NOT_AUTHORIZED, message: 'Invalid token'})]
        });

        await expect(invalidTokenCall).rejects.toThrow(expectedError);
    });

    it('Should throw UnauthorizedException with APIError NOT_AUTHORIZED if provided token is expired', async () => {
        const invalidTokenCall = async () => await authService.verifyToken(expiredToken);

        const expectedError = new UnauthorizedException({
            statusCode: 403,
            errors: [new APIError({reason: APIErrorReason.NOT_AUTHORIZED, message: 'Token has expired'})]
        });

        await expect(invalidTokenCall).rejects.toThrow(expectedError);
    });
});