import {TesterService} from "../../../../box/tester/tester.service";
import BoxModule from "../../modules/box.module";
import {Box} from "../../../../box/schemas/box.schema";
import ProfileModule from "../../../profile/modules/profile.module";
import PlayerModule from "../../../player/modules/player.module";
import {ObjectId} from "mongodb";
import BoxBuilderFactory from "../../data/boxBuilderFactory";

describe('TesterService.createTesters() test suite', () => {
    let service: TesterService;

    const boxModel = BoxModule.getBoxModel();
    const boxBuilder = BoxBuilderFactory.getBuilder('Box');
    let existingBox: Box;

    const profileModel = ProfileModule.getProfileModel();
    const playerModel = PlayerModule.getPlayerModel();

    beforeEach(async () => {
        service = await BoxModule.getTesterService();

        existingBox = boxBuilder
            .setAdminPlayerId(new ObjectId()).setAdminProfileId(new ObjectId())
            .setChatId(new ObjectId())
            .build();
        const boxResp = await boxModel.create(existingBox);
        existingBox._id = boxResp._id;
    });

    it('Should create specified amount of profiles in DB', async () => {
        const amount = 5;

        await service.createTesters(amount);

        const profilesInDB = await profileModel.find();

        expect(profilesInDB).toHaveLength(amount + 1);
    });

    it('Should create specified amount of players in DB', async () => {
        const amount = 5;

        await service.createTesters(amount);

        const playersInDB = await playerModel.find();

        expect(playersInDB).toHaveLength(amount + 1);
    });

    it('Should return created testers', async () => {
        const amount = 5;

        const [createdTesters, errors] = await service.createTesters(amount);

        expect(errors).toBeNull();
        expect(createdTesters).toHaveLength(amount + 1);
    });

    it('Should return ServiceError NOT_ALLOWED if amount is a negative number', async () => {
        const amount = -5;

        const [createdTesters, errors] = await service.createTesters(amount);

        expect(createdTesters).toBeNull();
        expect(errors).toContainSE_NOT_ALLOWED();
        expect(errors[0].field).toBe('amount');
        expect(errors[0].value).toBe(amount);
    });

    it('Should not created and profiles and players if amount is a negative number', async () => {
        const amount = -5;

        await service.createTesters(amount);

        const profilesInDB = await profileModel.find();
        const playersInDB = await playerModel.find();

        expect(profilesInDB).toHaveLength(1);
        expect(playersInDB).toHaveLength(1);
    });

    it('Should return ServiceError NOT_ALLOWED if amount is zero', async () => {
        const amount = 0;

        const [createdTesters, errors] = await service.createTesters(amount);

        expect(createdTesters).toBeNull();
        expect(errors).toContainSE_NOT_ALLOWED();
        expect(errors[0].field).toBe('amount');
        expect(errors[0].value).toBe(amount);
    });

    it('Should not created and profiles and players if amount is zero', async () => {
        const amount = 0;

        await service.createTesters(amount);

        const profilesInDB = await profileModel.find();
        const playersInDB = await playerModel.find();

        expect(profilesInDB).toHaveLength(1);
        expect(playersInDB).toHaveLength(1);
    });

    it('Should return ServiceError REQUIRED if amount is null', async () => {
        const [createdTesters, errors] = await service.createTesters(null);

        expect(createdTesters).toBeNull();
        expect(errors).toContainSE_REQUIRED();
        expect(errors[0].field).toBe('amount');
        expect(errors[0].value).toBeNull();
    });

    it('Should return ServiceError REQUIRED if amount is undefined', async () => {
        const [createdTesters, errors] = await service.createTesters(undefined);

        expect(createdTesters).toBeNull();
        expect(errors).toContainSE_REQUIRED();
        expect(errors[0].field).toBe('amount');
        expect(errors[0].value).toBeNull();
    });
});
