import formatResponse from '../../../common/controller/formatResponse';
import { ModelName } from '../../../common/enum/modelName.enum';

describe('formatResponse() test suite', () => {
  it('Should format a single object with a specified model name', () => {
    const data = { name: 'My clan', coins: 2 };
    const modelName = ModelName.CLAN;

    const result = formatResponse(data, modelName);

    expect(result).toEqual({
      data: {
        Clan: data,
      },
      metaData: {
        dataKey: 'Clan',
        modelName: 'Clan',
        dataType: 'Object',
        dataCount: 1,
      },
    });
  });

  it('Should format an array of objects with a specified model name', () => {
    const data = [{ name: 'Clan A' }, { name: 'Clan B' }];
    const modelName = ModelName.CLAN;

    const result = formatResponse(data, modelName);

    expect(result).toEqual({
      data: {
        Clan: data,
      },
      metaData: {
        dataKey: 'Clan',
        modelName: 'Clan',
        dataType: 'Array',
        dataCount: 2,
      },
    });
  });

  it('Should use "Object" as the default model name if none is provided', () => {
    const data = { name: 'My clan', coins: 2 };

    const result = formatResponse(data);

    expect(result).toEqual({
      data: {
        Object: data,
      },
      metaData: {
        dataKey: 'Object',
        modelName: 'Object',
        dataType: 'Object',
        dataCount: 1,
      },
    });
  });

  it('Should correctly format an empty array with default model name', () => {
    const data: any[] = [];

    const result = formatResponse(data);

    expect(result).toEqual({
      data: {
        Object: data,
      },
      metaData: {
        dataKey: 'Object',
        modelName: 'Object',
        dataType: 'Array',
        dataCount: 0,
      },
    });
  });
});
