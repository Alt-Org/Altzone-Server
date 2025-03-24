import { UseFilters } from '@nestjs/common';
import { Send204OnEmptyRes } from '../../../../common/interceptor/response/Send204OnEmptyRes';
import { FormatAPIResponse } from '../../../../common/decorator/response/FormatAPIResponse';
import { UniformResponse } from '../../../../common/decorator/response/UniformResponse';
import { ModelName } from '../../../../common/enum/modelName.enum';

jest.mock('../../../../common/interceptor/response/Send204OnEmptyRes', () => ({
  Send204OnEmptyRes: jest.fn(),
}));
jest.mock('@nestjs/common', () => {
  const commonPackage = jest.requireActual('@nestjs/common');
  return {
    ...commonPackage,
    UseFilters: jest.fn(),
  };
});
jest.mock('../../../../common/decorator/response/FormatAPIResponse', () => ({
  FormatAPIResponse: jest.fn(),
}));
jest.mock('../../../../common/exceptionFilter/ValidationExceptionFilter');
jest.mock('../../../../common/exceptionFilter/APIErrorFilter');

describe('UniformResponse() test suite', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Should call decorators in the correct order', () => {
    const mockTarget = {};
    const mockPropertyKey = 'testMethod';
    const mockDescriptor = {};

    const mockSend204OnEmptyRes = jest.fn();
    const mockUseFilters = jest.fn();
    const mockFormatAPIResponse = jest.fn();

    (Send204OnEmptyRes as jest.Mock).mockReturnValue(mockSend204OnEmptyRes);
    (UseFilters as jest.Mock).mockReturnValue(mockUseFilters);
    (FormatAPIResponse as jest.Mock).mockReturnValue(mockFormatAPIResponse);

    const modelName = ModelName.CLAN;
    const decoratorFunction = UniformResponse(modelName);

    decoratorFunction(
      mockTarget,
      mockPropertyKey,
      mockDescriptor as PropertyDescriptor,
    );

    expect(FormatAPIResponse).toHaveBeenCalledWith(modelName);

    expect(mockFormatAPIResponse).toHaveBeenCalledWith(
      mockTarget,
      mockPropertyKey,
      mockDescriptor,
    );
    expect(mockUseFilters).toHaveBeenCalledWith(
      mockTarget,
      mockPropertyKey,
      mockDescriptor,
    );
    expect(mockSend204OnEmptyRes).toHaveBeenCalledWith(
      mockTarget,
      mockPropertyKey,
      mockDescriptor,
    );
  });
});
