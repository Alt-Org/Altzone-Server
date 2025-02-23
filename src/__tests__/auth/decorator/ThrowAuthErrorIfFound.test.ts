import {ThrowAuthErrorIfFound} from "../../../auth/decorator/ThrowAuthErrorIfFound.decorator";
import {UnauthorizedException} from "@nestjs/common";
import {APIError} from "../../../common/controller/APIError";
import {APIErrorReason} from "../../../common/controller/APIErrorReason";

describe("@ThrowAuthErrorIfFound() test suite", () => {
    class TestService {
        @ThrowAuthErrorIfFound()
        syncMethod(value: any) {
            return value;
        }

        @ThrowAuthErrorIfFound()
        async asyncMethod(value: any) {
            return value;
        }
    }

    let service: TestService;

    beforeEach(() => {
        service = new TestService();
    });

    it("Should not throw if sync method does not throw", () => {
        expect(() => service.syncMethod("valid-data")).not.toThrow();
        expect(service.syncMethod("valid-data")).toBe("valid-data");
    });

    it("Should not throw if async method does not throw", async () => {
        await expect(service.asyncMethod("valid-data")).resolves.toBe("valid-data");
    });

    it("Should throw UnauthorizedException if sync method returns null", () => {
        expect(() => service.syncMethod(null)).toThrow(UnauthorizedException);
    });

    it("Should throw UnauthorizedException if async method returns null", async () => {
        await expect(service.asyncMethod(null)).rejects.toThrow(UnauthorizedException);
    });

    it("Should throw UnauthorizedException with correct message and error structure", () => {
        try {
            service.syncMethod(null);
        } catch (error: any) {
            expect(error).toBeInstanceOf(UnauthorizedException);
            expect(error.getResponse()).toEqual({
                message: "Credentials for that profile are incorrect",
                errors: [
                    new APIError({
                        reason: APIErrorReason.NOT_AUTHENTICATED,
                        message: "Credentials for that profile are incorrect",
                    }),
                ],
                statusCode: 401,
                error: "Unauthorized",
            });
        }
    });
});