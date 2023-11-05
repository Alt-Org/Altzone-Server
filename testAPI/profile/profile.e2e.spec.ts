import request from 'supertest';
import {Profile} from "../../src/profile/profile.schema";

let newProfile: Partial<Profile> = {
    username: 'bob',
    password: 'my_password'
}
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

const metaDataForObject = {
    dataKey: 'Profile',
    modelName: 'Profile',
    dataType: 'Object',
    dataCount: 1
}

describe('Profile', () => {

    it(`/profile POST, valid`, () => {
        return request('http://localhost')
            .post('/profile')
            .send(newProfile)
            .expect(201)
            .expect(function (resp) {
                if(!isRespValid(resp))
                    return;

                const dataKey = resp.body.metaData.dataKey;
                const dataObj: Record<any, any> = resp.body.data[dataKey];

                dataObj['password'] = newProfile.password;
                resp.body.data[dataKey] = cleanRespObj(dataObj);
            })
            .expect({
                data: {Profile: newProfile},
                metaData: metaDataForObject
            });
    });
    it(`/profile POST, valid and with Player`, () => {
        return request('http://localhost')
            .post('/profile')
            .send(newProfileWithPlayer)
            .expect(201)
            .expect(function (resp) {
                if(!isRespValid(resp))
                    return;

                const dataKey = resp.body.metaData.dataKey;
                const dataObj: Record<any, any> = resp.body.data[dataKey];

                dataObj['password'] = newProfileWithPlayer.password;
                const cleanedObject = cleanRespObj(dataObj);
                const {profile_id, ...cleanedPlayer} = cleanRespObj(cleanedObject.Player);

                resp.body.data[dataKey] = cleanedObject;
                if(cleanedPlayer)
                    resp.body.data[dataKey].Player = cleanedPlayer;
            })
            .expect({
                data: {Profile: newProfileWithPlayer},
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

const isRespValid = (resp: any) => {
    if(!resp.body)
        return false;

    if(!resp.body.metaData || !resp.body.metaData.dataKey || !resp.body.data)
        return false;

    return resp.body.data[resp.body.metaData.dataKey];
}

const cleanRespObj = (respObj: Record<any, any>) => {
    if(!respObj)
        return null;

    const {id, _id, __v, ...cleanedObject} = respObj;
    return cleanedObject;
}

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