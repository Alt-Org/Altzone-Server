import { UseFilters, UseInterceptors } from '@nestjs/common';
import { UniformResponse } from '../../../../common/decorator/response/UniformResponse';
import { Send204OnEmptyRes } from '../../../../common/interceptor/response/Send204OnEmptyRes';
import { ModelName } from '../../../../common/enum/modelName.enum';
import {FormatAPIResponseInterceptor} from "../../../../common/interceptor/response/FormatAPIResponse";

jest.mock('../../../../common/interceptor/response/Send204OnEmptyRes', () => ({
    Send204OnEmptyRes: jest.fn(),
}));
jest.mock('../../../../common/interceptor/response/FormatAPIResponse', () => ({
    FormatAPIResponseInterceptor: jest.fn(),
}));
jest.mock('@nestjs/common', () => {
    const common = jest.requireActual('@nestjs/common');
    return {
        ...common,
        UseFilters: jest.fn(),
        UseInterceptors: jest.fn(),
    };
});
jest.mock('../../../../common/exceptionFilter/ValidationExceptionFilter');
jest.mock('../../../../common/exceptionFilter/APIErrorFilter');

describe('UniformResponse() test suite', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('Should apply decorators in correct order with proper args', () => {
        const mockSend204 = jest.fn();
        const mockUseFilters = jest.fn();
        const mockUseInterceptors = jest.fn();

        (Send204OnEmptyRes as jest.Mock).mockReturnValue(mockSend204);
        (UseFilters as jest.Mock).mockReturnValue(mockUseFilters);
        (UseInterceptors as jest.Mock).mockReturnValue(mockUseInterceptors);

        const modelName = ModelName.CLAN;
        const decorator = UniformResponse(modelName);

        const mockTarget = {};
        const mockKey = 'create';
        const mockDescriptor = {};

        decorator(mockTarget, mockKey, mockDescriptor as PropertyDescriptor);

        // Assert decorators created with correct args
        expect(Send204OnEmptyRes).toHaveBeenCalled();
        expect(UseFilters).toHaveBeenCalled();
        expect(FormatAPIResponseInterceptor).toHaveBeenCalledWith(modelName);
        expect(UseInterceptors).toHaveBeenCalled();

        // Assert decorators applied to method
        expect(mockSend204).toHaveBeenCalledWith(mockTarget, mockKey, mockDescriptor);
        expect(mockUseFilters).toHaveBeenCalledWith(mockTarget, mockKey, mockDescriptor);
        expect(mockUseInterceptors).toHaveBeenCalledWith(mockTarget, mockKey, mockDescriptor);
    });
});
