import request from "supertest";
import {PlayerMocker} from "../../src/util/dataMock/playerMocker";
import {ProfileMocker} from "../../src/util/dataMock/profileMocker";
import {CommonMocker} from "../../src/util/dataMock/commonMocker";

const commonMocker = new CommonMocker();
const profileMocker = new ProfileMocker();
const playerMocker = new PlayerMocker();

const profile = profileMocker.getValid();
let player_id = '';
let profile_id = '';
let accessToken = '';

let player;
let notUniqueNameReq, notUniqueNameResp;
let notUniqueUniqueIdentifierReq, notUniqueUniqueIdentifierResp;
let wrongDTReq, wrongDTResp;

beforeAll(async () => {
    const resp = await commonMocker.cleanDB();
    const profileResp = await request('http://localhost')
        .post('/profile')
        .send(profile);

    profile_id = profileResp.body.data['Profile']._id;
    player = playerMocker.getValid();
    player.profile_id = profile_id;

    const notUniqueName = playerMocker.getNotUnique(player, 'name');
    notUniqueNameReq = notUniqueName[0];
    notUniqueNameResp = notUniqueName[1];
    const notUniqueUniqueIdentifier = playerMocker.getNotUnique(player, 'uniqueIdentifier');
    notUniqueUniqueIdentifierReq = notUniqueUniqueIdentifier[0];
    notUniqueUniqueIdentifierResp = notUniqueUniqueIdentifier[1];

    const wrongDT = playerMocker.getWrongDT();
    wrongDTReq = wrongDT[0];
    wrongDTReq['profile_id'] = profile_id;
    wrongDTResp =  wrongDT[1];

    return resp;
});

afterAll(async () => {
    return await commonMocker.cleanDB();
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
                data: {Player: player},
                metaData: playerMocker.getObjMeta()
            });
    });

    it(`send with not unique name`, () => {
        return request('http://localhost')
            .post('/player')
            .send(notUniqueNameReq)
            //.expect(409)
            .expect(notUniqueNameResp);
    });
    it(`send with not unique uniqueIdentifier`, () => {
        return request('http://localhost')
            .post('/player')
            .send(notUniqueUniqueIdentifierReq)
            //.expect(409)
            .expect(notUniqueUniqueIdentifierResp);
    });
    it(`send with wrong data types`, () => {
        return request('http://localhost')
            .post('/player')
            .send(wrongDTReq)
            .expect(400)
            .expect(wrongDTResp);
    });

    it(`Authorize with created profile`, () => {
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

    it(`Check is Player created`, () => {
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
                data: {Player: player},
                metaData: playerMocker.getObjMeta()
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