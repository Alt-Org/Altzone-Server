import {TesterService} from "../../../../box/tester/tester.service";
import BoxModule from "../../modules/box.module";
import {Box} from "../../../../box/schemas/box.schema";
import ProfileModule from "../../../profile/modules/profile.module";
import PlayerModule from "../../../player/modules/player.module";
import ClanModule from "../../../clan/modules/clan.module";
import {Clan} from "../../../../clan/clan.schema";
import {ObjectId} from "mongodb";
import BoxBuilderFactory from "../../data/boxBuilderFactory";
import ClanBuilderFactory from "../../../clan/data/clanBuilderFactory";

describe('TesterService.deleteTesters() test suite', () => {
    let service: TesterService;

    const boxModel = BoxModule.getBoxModel();
    const boxBuilder = BoxBuilderFactory.getBuilder('Box');
    let existingBox: Box;

    const profileModel = ProfileModule.getProfileModel();
    const playerModel = PlayerModule.getPlayerModel();
    const clanModel = ClanModule.getClanModel();
    const clanBuilder = ClanBuilderFactory.getBuilder('Clan');
    let boxClan1: Clan, boxClan2: Clan;

    beforeEach(async () => {
        service = await BoxModule.getTesterService();

        boxClan1 = clanBuilder.setName('clan1').build();
        const clan1Resp = await clanModel.create(boxClan1);
        boxClan1._id = clan1Resp._id;
        boxClan2 = clanBuilder.setName('clan2').build();
        const clan2Resp = await clanModel.create(boxClan2);
        boxClan2._id = clan2Resp._id;

        existingBox = boxBuilder
            .setAdminPlayerId(new ObjectId()).setAdminProfileId(new ObjectId())
            .setClanIds([boxClan1._id as any, boxClan2._id as any])
            .setSoulHomeIds([new ObjectId(), new ObjectId()]).setRoomIds([new ObjectId(), new ObjectId()])
            .setStockIds([new ObjectId(), new ObjectId()])
            .setChatId(new ObjectId())
            .build();
        const boxResp = await boxModel.create(existingBox);
        existingBox._id = boxResp._id;
    });

    it('Should ', async () => {

    });

});
