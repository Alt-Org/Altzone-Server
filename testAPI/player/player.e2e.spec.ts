import request from "supertest";
import {PlayerMock} from "../../src/util/dataMock/playerMock";

export const metaDataForObject = {
    dataKey: 'Model',
    modelName: 'Model',
    dataType: 'Object',
    dataCount: 1
}

const profile = {username: 'john', password: 'lol'};
let player = PlayerMock.getValid();
let player_id = '';
let profile_id = '';
let accessToken = '';

beforeAll(async () => {
    const profileResp = await request('http://localhost')
        .post('/profile')
        .send(profile);

    profile_id = profileResp.body.data['Profile']._id;
    player.profile_id = profile_id;
});

describe('Create player, /player POST', () => {
    it(`send valid request`, () => {
        return request('http://localhost')
            .post('/player')
            .send(player)
            .expect(201)
            .expect(function (resp) {
                if(!isRespValid(resp))
                    return;

                const dataKey = resp.body.metaData.dataKey;
                const dataObj: Record<any, any> = resp.body.data[dataKey];
                player_id = dataObj._id;

                resp.body.data[dataKey] = cleanRespObj(dataObj);
            })
            .expect({
                data: {Model: player},
                metaData: metaDataForObject
            });
    });

    it(`authorize with created profile`, () => {
        return request('http://localhost')
            .post('/auth/signIn')
            .send(profile)
            .expect(201)
            .expect((resp) => {
                if(!resp.body.accessToken)
                    throw new Error('Unable to authorize with provided credentials');

                accessToken = resp.body.accessToken;
            })
    });

    it(`check is Player created`, () => {
        return request('http://localhost')
            .get(`/player/${player_id}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200)
            .expect(function (resp) {
                if(!isRespValid(resp))
                    return;

                const dataKey = resp.body.metaData.dataKey;
                const dataObj: Record<any, any> = resp.body.data[dataKey];

                resp.body.data[dataKey] = cleanRespObj(dataObj);
            })
            .expect({
                data: {Model: player},
                metaData: metaDataForObject
            });
    });
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