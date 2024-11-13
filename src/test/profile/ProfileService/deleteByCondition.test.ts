import {ProfileService} from "../../../profile/profile.service";
import ProfileBuilderFactory from "../data/profileBuilderFactory";
import ProfileModule from "../modules/profile.module";

describe('ProfileService.deleteByCondition() test suite', () => {
    let profileService: ProfileService;
    const profileBuilder = ProfileBuilderFactory.getBuilder('Profile');
    const username1 = 'user1';
    const username2 = 'user2';

    const profileModel = ProfileModule.getProfileModel();

    beforeEach(async () => {
        await profileModel.deleteMany({});
        profileService = await ProfileModule.getProfileService();

        const profileToCreate1 = profileBuilder.setUsername(username1).build();
        await profileModel.create(profileToCreate1);

        const profileToCreate2 = profileBuilder.setUsername(username2).build();
        await profileModel.create(profileToCreate2);
    });

    it('Should delete a single profile based on condition if options.isOne is true', async () => {
        const condition = { username: username1 };
        const result = await profileService.deleteByCondition(condition, { isOne: true });

        expect(result['deletedCount']).toBe(1);

        const deletedProfile = await profileModel.findOne({ username: username1 });
        expect(deletedProfile).toBeNull();
    });

    it('Should not delete profile, which does not match the condition', async () => {
        const condition = { username: username1 };
        await profileService.deleteByCondition(condition, { isOne: true });

        const unaffectedProfile = await profileModel.findOne({ username: username2 });
        expect(unaffectedProfile).not.toBeNull();
        expect(unaffectedProfile.username).toBe(username2);
    });

    it('Should delete multiple profiles based on condition if options.isOne is false or undefined', async () => {
        const condition = { username: { $in: [username1, username2] } };
        const result = await profileService.deleteByCondition(condition);

        expect(result['deletedCount']).toBe(2);

        const deletedProfiles = await profileModel.find({ username: { $in: [username1, username2] } });
        expect(deletedProfiles.length).toBe(0);
    });

    it('Should return null if no profiles match the condition for single deletion', async () => {
        const condition = { username: 'nonExistentUser' };
        const result = await profileService.deleteByCondition(condition, { isOne: true });

        expect(result).toBeNull();
    });

    it('Should return null if no profiles match the condition for multiple deletion', async () => {
        const condition = { username: 'nonExistentUser' };
        const result = await profileService.deleteByCondition(condition);

        expect(result).toBeNull();
    });
});