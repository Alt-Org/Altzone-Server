import {ProfileService} from "../../../profile/profile.service";
import ProfileBuilderFactory from "../data/profileBuilderFactory";
import ProfileModule from "../modules/profile.module";
import {Profile} from "../../../profile/profile.schema";
import {getNonExisting_id} from "../../test_utils/util/getNonExisting_id";
import {MongoServerError} from "mongodb";

describe('ProfileService.updateOneById() test suite', () => {
    let profileService: ProfileService;
    const profileBuilder = ProfileBuilderFactory.getBuilder('Profile');
    let existingProfile: Profile;

    const profileModel = ProfileModule.getProfileModel();

    beforeEach(async () => {
        profileService = await ProfileModule.getProfileService();
        const profileToCreate = profileBuilder.build();
        const profileResp = await profileModel.create(profileToCreate);
        existingProfile = profileResp.toObject();
    });

    it('Should successfully update an existing profile', async () => {
        const updateData = { _id: existingProfile._id, username: 'newUsername' };
        const resp = await profileService.updateOneById(updateData);

        expect(resp).toBeTruthy();

        const updatedProfile = await profileModel.findById(existingProfile._id);
        expect(updatedProfile.username).toBe(updateData.username);
    });

    it('Should throw error if the username already exists', async () => {
        const anotherProfileData = profileBuilder.setUsername('anotherUsername').build();
        await profileModel.create(anotherProfileData);

        const updateData = { _id: existingProfile._id, username: 'anotherUsername' };

        await expect(profileService.updateOneById(updateData)).rejects.toThrow(MongoServerError);
    });

    it('Should not throw error if the profile is not found', async () => {
        const nonExistingId = getNonExisting_id();
        const updateData = { _id: nonExistingId, username: 'newUsername' };

        const result = await profileService.updateOneById(updateData);

        expect(result['modifiedCount']).toBe(0);
    });
});