import request from 'supertest';
import {IResponseShape} from "../../src/common/interface/IResponseShape";
import {Profile} from "../../src/profile/profile.schema";

const fixed_id = 'fixed_id_for_testing_purposes';

let newProfileWithPlayer: Partial<Profile> = {
    username: 'john',
    password: 'my_password',
    //@ts-ignore
    Player: {
        name: 'John Doe',
        backpackCapacity: 12,
        uniqueIdentifier: 'johnIdentifier',
    }
}
let createdObject: any;

const metaDataForObject = {
    dataKey: 'Model',
    modelName: 'Model',
    dataType: 'Object',
    dataCount: 1
}

describe('Profile', () => {

    it(`/profile POST, valid and with Player`, () => {
        return request('http://localhost')
            .post('/profile')
            .send(newProfileWithPlayer)
            .expect(201)
            .expect(function (resp) {
                const dataKey = resp.body.metaData.dataKey;
                const dataObj: Record<any, any> = resp.body.data[dataKey] || {};
                dataObj['_id'] = undefined;
                dataObj['id'] = undefined;
                dataObj['__v'] = undefined;
                dataObj['password'] = newProfileWithPlayer.password;
                if(dataObj.Player){
                    dataObj['Player']['_id'] = undefined;
                    dataObj['Player']['id'] = undefined;
                    dataObj['Player']['__v'] = undefined;
                    dataObj['Player']['profile_id'] = undefined;
                }

                delete dataObj['_id'];
                delete dataObj['id'];
                delete dataObj['__v'];
                delete dataObj['Player']['_id'];
                delete dataObj['Player']['id'];
                delete dataObj['Player']['__v'];
                delete dataObj['Player']['profile_id'];

                resp.body.data[dataKey] = dataObj;
            })
            .expect({
                data: {Model: newProfileWithPlayer},
                metaData: metaDataForObject
            });
    });

    // it(`/GET profile`, () => {
    //     return request('http://localhost')
    //         .get('/profile')
    //         .expect(401)
    //         .expect({
    //             data: profileMockService.readAll(),
    //         });
    // });
});

// const getStandardRespFieldsToObject = (expectedData: any, _id?: any) => {
//     const testingId = _id || testing_id;
//     const resp = {
//         data: {
//             ...expectedData,
//             _id: testingId,
//             id: testingId,
//             __v: 0
//         }
//     }
// }