import { ObjectId } from 'mongodb';
import LoggedUser from '../test_utils/const/loggedUser';
import Factory from './data/factory';
import ClanModule from './modules/clan.module';
import { ClanService } from '../../clan_module/clan/clan.service';

describe('ClanService test suite', () => {
    let clanService: ClanService;
    const clanBuilder = Factory.getBuilder('CreateClanDto');
    const loggedPlayer = LoggedUser.getPlayer();
    const clanModel = ClanModule.getClanModel();

    beforeAll(async () => {
        clanService = await ClanModule.getClanService(); 
    });

    it('Should create a clan in DB, if valid params provided', async () => {
        const clanName = 'clan1';
        const clanToCreate = clanBuilder.setName(clanName).build();

        const [result, errors] = await clanService.createOne(clanToCreate, loggedPlayer._id);

        const clanInDB = await clanModel.findOne({ name: clanName });

        expect(errors).toBeNull();
        expect(result).toEqual(expect.objectContaining({...clanToCreate, _id: expect.any(ObjectId)}));
        expect(result).toEqual(expect.objectContaining({ ...clanInDB.toObject() }));
    });
});