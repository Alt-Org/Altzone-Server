import {TesterService} from "../../../../box/tester/tester.service";
import BoxModule from "../../modules/box.module";
import {Box} from "../../../../box/schemas/box.schema";
import {ObjectId} from "mongodb";
import BoxBuilderFactory from "../../data/boxBuilderFactory";
import {getNonExisting_id} from "../../../test_utils/util/getNonExisting_id";

describe('TesterService.addTestersToBox() test suite', () => {
    let service: TesterService;
    const testerBuilder = BoxBuilderFactory.getBuilder('Tester');
    const tester1 = testerBuilder.setProfileId(new ObjectId()).setPlayerId(new ObjectId()).build();
    const tester2 = testerBuilder.setProfileId(new ObjectId()).setPlayerId(new ObjectId()).build();
    const testersToAdd = [tester1, tester2];

    const boxModel = BoxModule.getBoxModel();
    const boxBuilder = BoxBuilderFactory.getBuilder('Box');
    let existingBox: Box;

    beforeEach(async () => {
        service = await BoxModule.getTesterService();

        existingBox = boxBuilder
            .setAdminPlayerId(new ObjectId()).setAdminProfileId(new ObjectId())
            .setChatId(new ObjectId())
            .build();
        const boxResp = await boxModel.create(existingBox);
        existingBox._id = boxResp._id;
    });

    it('Should add testers data to the box and return true', async () => {
        const [areAdded, errors] = await service.addTestersToBox(existingBox._id, testersToAdd);

        const boxInDB = await boxModel.findById(existingBox._id);

        const testersInDB = boxInDB.testers.map(tester => {
            return { profile_id: tester.profile_id, player_id: tester.player_id, isClaimed: tester.isClaimed }
        });

        expect(errors).toBeNull();
        expect(areAdded).toBeTruthy();
        expect(testersInDB).toEqual(testersToAdd);
    });

    it('Should not remove any old testers data from the box', async () => {
        const anotherTester = testerBuilder.setProfileId(new ObjectId()).setPlayerId(new ObjectId()).build();
        await boxModel.findByIdAndUpdate(existingBox._id, {$push: {testers: anotherTester}})

        await service.addTestersToBox(existingBox._id, testersToAdd);

        const boxInDB = await boxModel.findById(existingBox._id).exec();
        const oldTester = boxInDB.testers.find(tester => tester.profile_id.toString() === anotherTester.profile_id.toString());

        expect(boxInDB.testers).toHaveLength(1 + testersToAdd.length);
        expect(oldTester).not.toBeNull();
    });

    it('Should return REQUIRED ServiceError if box_id is null', async () => {
        const [areAdded, errors] = await service.addTestersToBox(null, testersToAdd);

        expect(areAdded).toBeNull();
        expect(errors).toContainSE_REQUIRED();
        expect(errors[0].field).toBe('box_id');
        expect(errors[0].value).toBeNull();
    });

    it('Should return REQUIRED ServiceError if box_id is undefined', async () => {
        const [areAdded, errors] = await service.addTestersToBox(undefined, testersToAdd);

        expect(areAdded).toBeNull();
        expect(errors).toContainSE_REQUIRED();
        expect(errors[0].field).toBe('box_id');
        expect(errors[0].value).toBeNull();
    });

    it('Should return REQUIRED ServiceError if box_id is an empty string', async () => {
        const [areAdded, errors] = await service.addTestersToBox('', testersToAdd);

        expect(areAdded).toBeNull();
        expect(errors).toContainSE_REQUIRED();
        expect(errors[0].field).toBe('box_id');
        expect(errors[0].value).toBe('');
    });

    it('Should return REQUIRED ServiceError if testersToRegister is null', async () => {
        const [areAdded, errors] = await service.addTestersToBox(existingBox._id, null);

        expect(areAdded).toBeNull();
        expect(errors).toContainSE_REQUIRED();
        expect(errors[0].field).toBe('testers');
        expect(errors[0].value).toBeNull();
    });

    it('Should return REQUIRED ServiceError if testersToRegister is undefined', async () => {
        const [areAdded, errors] = await service.addTestersToBox(existingBox._id, undefined);

        expect(areAdded).toBeNull();
        expect(errors).toContainSE_REQUIRED();
        expect(errors[0].field).toBe('testers');
        expect(errors[0].value).toBeNull();
    });

    it('Should return REQUIRED ServiceError if testersToRegister is an empty array', async () => {
        const [areAdded, errors] = await service.addTestersToBox(existingBox._id, []);

        expect(areAdded).toBeNull();
        expect(errors).toContainSE_REQUIRED();
        expect(errors[0].field).toBe('testers');
        expect(errors[0].value).toEqual([]);
    });

    it('Should return NOT_FOUND ServiceError if box with provided _id does not exists', async () => {
        const nonExisting_id = new ObjectId(getNonExisting_id());
        const [areAdded, errors] = await service.addTestersToBox(nonExisting_id, testersToAdd);

        expect(areAdded).toBeNull();
        expect(errors).toContainSE_NOT_FOUND();
        expect(errors[0].field).toBe('box_id');
        expect(errors[0].value).toEqual(nonExisting_id);
    });
});
