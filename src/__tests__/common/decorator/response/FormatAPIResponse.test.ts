import { HttpException } from "@nestjs/common";
import { convertToAPIError, APIError } from "../../../../common/controller/APIError";
import formatResponse from "../../../../common/controller/formatResponse";
import { FormatAPIResponse } from "../../../../common/decorator/response/FormatAPIResponse";
import { ModelName } from "../../../../common/enum/modelName.enum";
import ServiceError from "../../../../common/service/basicService/ServiceError";
import Factory from "../../../clan_module/data/factory";
import { SEReason } from "../../../../common/service/basicService/SEReason";
import { APIErrorReason } from "../../../../common/controller/APIErrorReason";


jest.mock("../../../../common/controller/formatResponse");

describe('FormatAPIResponse() test suite', () => {
    let mockDescriptor: PropertyDescriptor;
    let mockOriginalMethod: jest.Mock;
    const clanBuilder = Factory.getBuilder('Clan');
    const modelName = ModelName.CLAN; 

    beforeEach(() => {
        jest.clearAllMocks();
        mockOriginalMethod = jest.fn();
        mockDescriptor = { value: mockOriginalMethod };

        const decorator = FormatAPIResponse(ModelName.CLAN);
        decorator({}, 'testMethod', mockDescriptor);
    });

    it('Should format response when valid data is returned', () => {
        const returnedClanData = clanBuilder.build();
        mockOriginalMethod.mockReturnValue(returnedClanData);

        (formatResponse as jest.Mock).mockReturnValue({ data: returnedClanData });

        const result = mockDescriptor.value();

        expect(formatResponse).toHaveBeenCalledWith(returnedClanData, modelName);
        expect(result).toEqual({ data: returnedClanData });
    });

    it('Should throw HttpException with converted to APIErrors when ServiceError is returned', () => {
        const returnedServiceError = new ServiceError({ reason: SEReason.NOT_BOOLEAN });
        mockOriginalMethod.mockReturnValue(returnedServiceError);

        expect(() => mockDescriptor.value()).toThrow(HttpException);

        const expectedErrors = [
            convertToAPIError(returnedServiceError)
        ];
        const expectedStatus = expectedErrors[0].statusCode;

        try {
            mockDescriptor.value();
        } catch (error: any) {
            expect(error).toBeInstanceOf(HttpException);
            expect(error.getResponse()).toEqual({
                errors: expect.arrayContaining(expectedErrors),
                statusCode: expectedStatus
            });
            expect(error.getStatus()).toBe(expectedStatus);
        }
    });

    it('Should handle promises and format response asynchronously', async () => {
        const returnedClanData = clanBuilder.build();

        mockOriginalMethod.mockResolvedValue(returnedClanData);

        (formatResponse as jest.Mock).mockReturnValue({ data: returnedClanData });

        const result = await mockDescriptor.value();

        expect(formatResponse).toHaveBeenCalledWith(returnedClanData, modelName);
        expect(result).toEqual({ data: returnedClanData });
    });

    it('Should throw an HttpException when a tuple with an error is returned', () => {
        const returnedAPIError = new APIError({ message: 'Less than min', reason: APIErrorReason.LESS_THAN_MIN });
        mockOriginalMethod.mockReturnValue([null, returnedAPIError]);

        expect(() => mockDescriptor.value()).toThrow(HttpException);

        try {
            mockDescriptor.value();
        } catch (error: any) {
            expect(error).toBeInstanceOf(HttpException);
            expect(error.getResponse()).toEqual({
                errors: expect.arrayContaining([returnedAPIError]),
                statusCode: returnedAPIError.statusCode
            });
            expect(error.getStatus()).toBe(returnedAPIError.statusCode);
        }
    });

    it('Should throw an APIError when a promise resolves with an error tuple', async () => {
        const returnedAPIError = new APIError({ message: 'Async tuple error', reason: APIErrorReason.NOT_AUTHORIZED });
        mockOriginalMethod.mockResolvedValue([null, returnedAPIError]);

        await expect(mockDescriptor.value()).rejects.toThrow(HttpException);

        try {
            await mockDescriptor.value();
        } catch (error: any) {
            expect(error).toBeInstanceOf(HttpException);
            expect(error.getResponse()).toEqual({
                errors: expect.arrayContaining([returnedAPIError]),
                statusCode: returnedAPIError.statusCode
            });
            expect(error.getStatus()).toBe(returnedAPIError.statusCode);
        }
    });
});