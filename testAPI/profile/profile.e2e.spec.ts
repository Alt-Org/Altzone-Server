import request from 'supertest';
import {IResponseShape} from "../../src/common/interface/IResponseShape";
import {ModelName} from "../../src/common/enum/modelName.enum";

describe('Profile', () => {
    let profileMockService = {
        readAll: (): IResponseShape => {
            return {
                data: {Profile: []},
                metaData: {
                    dataKey: 'Profile',
                    modelName: ModelName.PROFILE,
                    dataType: 'Array'
                }
            }
        }
    }

    it(`/GET profile`, () => {
        return request('http://localhost')
            .get('/profile')
            .expect(401)
            .expect({
                data: profileMockService.readAll(),
            });
    });
});