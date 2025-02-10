import {ProfileService} from "../../../profile/profile.service";
import ProfileBuilderFactory from "../data/profileBuilderFactory";
import ProfileModule from "../modules/profile.module";
import {CreateProfileDto} from "../../../profile/dto/createProfile.dto";
import * as argon2 from 'argon2';

describe('ProfileService.createWithHashedPassword() test suite', () => {
    let profileService: ProfileService;
    const profileBuilder = ProfileBuilderFactory.getBuilder('CreateProfileDto');
    const password = 'my-password';
    let createProfileData: CreateProfileDto;

    const profileModel = ProfileModule.getProfileModel();

    beforeEach(async () => {
        profileService = await ProfileModule.getProfileService();
        createProfileData = profileBuilder.setPassword(password).build();
    });

    it('Should return created profile with a hashed password', async () => {
        const [profile, errors] = await profileService.createWithHashedPassword(createProfileData) as any;

        expect(errors).toBeNull();

        expect(profile).not.toBeNull();
        expect(profile.password).not.toBe(createProfileData.password);
        expect(await argon2.verify(profile.password, createProfileData.password)).toBe(true);
    });

    it('Should create profile in DB with a hashed password', async () => {
        await profileService.createWithHashedPassword(createProfileData);

        const dbResp = await profileModel.findOne({ username: createProfileData.username });

        expect(dbResp.username).toBe(createProfileData.username);
        expect(await argon2.verify(dbResp.password, createProfileData.password)).toBe(true);
    });

    it('Should handle missing or invalid password gracefully', async () => {
        const invalidProfileData = { ...createProfileData, password: undefined } as CreateProfileDto;

        const [profile, errors] = await profileService.createWithHashedPassword(invalidProfileData);

        expect(profile).toBeNull();
        expect(errors).toContainSE_UNEXPECTED();
    });

    it('Should not create profile if input data is invalid', async () => {
        const invalidProfileData = { ...createProfileData, password: undefined } as CreateProfileDto;

         await profileService.createWithHashedPassword(invalidProfileData);

        const dbResp = await profileModel.findOne({ username: createProfileData.username });

        expect(dbResp).toBeNull();
    });
});