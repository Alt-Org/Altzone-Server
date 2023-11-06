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

let wrongDataTypes = {
    username: 34,
    password: true
}
let wrongDataTypesResponse = {
    "statusCode": 400,
    "message": [
        "username must be a string",
        "password must be a string"
    ],
    "error": "Bad Request"
}

let notUniqueUserName = newProfile;
let notUniqueUserNameResponse = {
    "statusCode": 409,
    "message": [
        `Field 'username' with value '${notUniqueUserName.username}' already exists`
    ],
    "error": "Conflict"
};

let wrongDataTypesPlayer = {
    username: 'greg',
    password: 'my_password',
    "Player": {
        "name": 45,
        "backpackCapacity": "67",
        "uniqueIdentifier": false
    }
}
let wrongDataTypesPlayerResponse = {
    "statusCode": 400,
    "message": [
        "Player.name must be a string",
        "Player.backpackCapacity must be an integer number",
        "Player.uniqueIdentifier must be a string"
    ],
    "error": "Bad Request"
}

let notUniquePlayerName = {
    username: 'greg',
    password: 'password',
    Player: {
        name: newProfileWithPlayer.Player.name,
        backpackCapacity: 12,
        uniqueIdentifier: 'gregIdentifier',
    }
}
let notUniquePlayerNameResponse = {
    "statusCode": 409,
    "message": [
        `Field 'name' with value '${notUniquePlayerName.Player.name}' already exists`
    ],
    "error": "Conflict"
}

let notUniquePlayerUniqueIdentifier = {
    username: 'greg',
    password: 'password',
    Player: {
        name: "Greg",
        backpackCapacity: 12,
        uniqueIdentifier: newProfileWithPlayer.Player.uniqueIdentifier,
    }
}
let notUniquePlayerUniqueIdentifierResponse = {
    "statusCode": 409,
    "message": [
        `Field 'uniqueIdentifier' with value '${notUniquePlayerUniqueIdentifier.Player.uniqueIdentifier}' already exists`
    ],
    "error": "Conflict"
}

describe('Create profile, /profile POST', () => {
    it(`send valid request`, () => {
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
    it(`send valid request with Player`, () => {
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

    it(`send wrong data types`, () => {
        return request('http://localhost')
            .post('/profile')
            .send(wrongDataTypes)
            .expect(400)
            .expect(wrongDataTypesResponse);
    });
    it(`send not unique username`, () => {
        return request('http://localhost')
            .post('/profile')
            .send(notUniqueUserName)
            .expect(409)
            .expect(notUniqueUserNameResponse);
    });

    it(`send wrong data types for Player`, () => {
        return request('http://localhost')
            .post('/profile')
            .send(wrongDataTypesPlayer)
            .expect(400)
            .expect(wrongDataTypesPlayerResponse);
    });
    it(`send not unique Player name`, () => {
        return request('http://localhost')
            .post('/profile')
            .send(notUniquePlayerName)
            .expect(409)
            .expect(notUniquePlayerNameResponse);
    });
    it(`send not unique Player uniqueIdentifier`, () => {
        return request('http://localhost')
            .post('/profile')
            .send(notUniquePlayerUniqueIdentifier)
            .expect(409)
            .expect(notUniquePlayerUniqueIdentifierResponse);
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