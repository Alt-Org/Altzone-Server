// import request from 'supertest';
//
// // @ts-ignore
// import {
//     metaDataForObject,
//     newProfile,
//     newProfileWithPlayer,
//     notUniquePlayerName,
//     notUniquePlayerNameResponse,
//     notUniquePlayerUniqueIdentifier,
//     notUniquePlayerUniqueIdentifierResponse,
//     notUniqueUserName,
//     notUniqueUserNameResponse,
//     wrongDataTypes,
//     wrongDataTypesPlayer,
//     wrongDataTypesPlayerResponse,
//     wrongDataTypesResponse
// } from './testData';
//
// let accessToken = '';
// let accessTokenWithPlayer = '';
// let createdProfile_id = '';
// let createdProfileWithPlayer_id = '';
//
// describe('Create profile, /profile POST', () => {
//     it(`send valid request`, () => {
//         return request('http://localhost')
//             .post('/profile')
//             .send(newProfile)
//             .expect(201)
//             .expect(function (resp) {
//                 if(!isRespValid(resp))
//                     return;
//
//                 const dataKey = resp.body.metaData.dataKey;
//                 const dataObj: Record<any, any> = resp.body.data[dataKey];
//                 createdProfile_id = dataObj._id;
//
//                 dataObj['password'] = newProfile.password;
//                 resp.body.data[dataKey] = cleanRespObj(dataObj);
//             })
//             .expect({
//                 data: {Profile: newProfile},
//                 metaData: metaDataForObject
//             });
//     });
//     it(`send valid request with Player`, () => {
//         return request('http://localhost')
//             .post('/profile')
//             .send(newProfileWithPlayer)
//             .expect(201)
//             .expect(function (resp) {
//                 if(!isRespValid(resp))
//                     return;
//
//                 const dataKey = resp.body.metaData.dataKey;
//                 const dataObj: Record<any, any> = resp.body.data[dataKey];
//                 createdProfileWithPlayer_id = dataObj._id;
//
//                 dataObj['password'] = newProfileWithPlayer.password;
//                 const cleanedObject = cleanRespObj(dataObj);
//                 const {profile_id, ...cleanedPlayer} = cleanRespObj(cleanedObject.Player);
//
//                 resp.body.data[dataKey] = cleanedObject;
//                 if(cleanedPlayer)
//                     resp.body.data[dataKey].Player = cleanedPlayer;
//             })
//             .expect({
//                 data: {Profile: newProfileWithPlayer},
//                 metaData: metaDataForObject
//             });
//     });
//
//     it(`send wrong data types`, () => {
//         return request('http://localhost')
//             .post('/profile')
//             .send(wrongDataTypes)
//             .expect(400)
//             .expect(wrongDataTypesResponse);
//     });
//     it(`send not unique username`, () => {
//         return request('http://localhost')
//             .post('/profile')
//             .send(notUniqueUserName)
//             .expect(409)
//             .expect(notUniqueUserNameResponse);
//     });
//
//     it(`send wrong data types for Player`, () => {
//         return request('http://localhost')
//             .post('/profile')
//             .send(wrongDataTypesPlayer)
//             .expect(400)
//             .expect(wrongDataTypesPlayerResponse);
//     });
//     it(`send not unique Player name`, () => {
//         return request('http://localhost')
//             .post('/profile')
//             .send(notUniquePlayerName)
//             .expect(409)
//             .expect(notUniquePlayerNameResponse);
//     });
//     it(`send not unique Player uniqueIdentifier`, () => {
//         return request('http://localhost')
//             .post('/profile')
//             .send(notUniquePlayerUniqueIdentifier)
//             .expect(409)
//             .expect(notUniquePlayerUniqueIdentifierResponse);
//     });
//
//     it(`add Player to profile without it`, () => {
//         return request('http://localhost')
//             .post('/player')
//             .send({
//                 name: 'Bob',
//                 backpackCapacity: 12,
//                 uniqueIdentifier: 'bobIdentifier',
//                 profile_id: createdProfile_id
//             })
//             .expect(201)
//     });
//
//     it(`authorize with created profile`, () => {
//         return request('http://localhost')
//             .post('/auth/signIn')
//             .send({username: newProfile.username, password: newProfile.password})
//             .expect(201)
//             .expect((resp) => {
//                 if(!resp.body.accessToken)
//                     throw new Error('Unable to authorize with provided credentials');
//
//                 accessToken = resp.body.accessToken;
//             })
//     });
//     it(`authorize with created profile with Player`, () => {
//         return request('http://localhost')
//             .post('/auth/signIn')
//             .send(newProfileWithPlayer)
//             .expect(201)
//             .expect((resp) => {
//                 if(!resp.body.accessToken)
//                     throw new Error('Unable to authorize with provided credentials');
//
//                 accessTokenWithPlayer = resp.body.accessToken;
//             })
//     });
//     it(`check profiles were created`, () => {
//         return request('http://localhost')
//             .get('/profile')
//             .set('Authorization', `Bearer ${accessTokenWithPlayer}`)
//             .expect(200)
//             .expect( (resp) => {
//                 const isProfile = resp.body.data['Profile'].find(p => p.username === newProfile.username);
//                 const isProfileWithPlayer = resp.body.data['Profile'].find(p => p.username === newProfileWithPlayer.username);
//
//                 if(!isProfile && !isProfileWithPlayer)
//                     throw new Error('Unable to find any of created profiles');
//                 if(!isProfile)
//                     throw new Error('Unable to find profile without Player');
//                 if(!isProfileWithPlayer)
//                     throw new Error('Unable to find profile with Player');
//             });
//     });
//     it(`delete created profile`, () => {
//         return request('http://localhost')
//             .delete(`/profile/${createdProfile_id}`)
//             .set('Authorization', `Bearer ${accessToken}`)
//             .expect(200)
//     });
//     it(`delete created profile with Player`, () => {
//         return request('http://localhost')
//             .delete(`/profile/${createdProfileWithPlayer_id}`)
//             .set('Authorization', `Bearer ${accessTokenWithPlayer}`)
//             .expect(200)
//     });
// });
//
// const isRespValid = (resp: any) => {
//     if(!resp.body)
//         return false;
//
//     if(!resp.body.metaData || !resp.body.metaData.dataKey || !resp.body.data)
//         return false;
//
//     return resp.body.data[resp.body.metaData.dataKey];
// }
//
// const cleanRespObj = (respObj: Record<any, any>) => {
//     if(!respObj)
//         return null;
//
//     const {id, _id, __v, ...cleanedObject} = respObj;
//     return cleanedObject;
// }