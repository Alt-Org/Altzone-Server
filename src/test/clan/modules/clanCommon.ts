import {Test, TestingModule} from '@nestjs/testing';
import {MongooseModule} from '@nestjs/mongoose';
import {RequestHelperModule} from '../../../requestHelper/requestHelper.module';
import {ModelName} from '../../../common/enum/modelName.enum';
import {mongooseOptions, mongoString} from '../../test_utils/const/db';
import {ClanInventoryModule} from "../../../clanInventory/clanInventory.module";
import {ClanSchema} from "../../../clan/clan.schema";
import {joinSchema} from "../../../clan/join/join.schema";
import {PlayerSchema} from "../../../player/player.schema";
import ClanHelperService from "../../../clan/utils/clanHelper.service";
import {JoinService} from "../../../clan/join/join.service";
import {ClanService} from "../../../clan/clan.service";
import {isClanExists} from "../../../clan/decorator/validation/IsClanExists.decorator";
import {PlayerCounterFactory} from "../../../clan/clan.counters";


export default class ClanCommonModule {
    private constructor() {
    }

    private static module: TestingModule;

    static async getModule() {
        if (!ClanCommonModule.module)
            ClanCommonModule.module = await Test.createTestingModule({
                imports: [
                    MongooseModule.forRoot(mongoString, mongooseOptions),
                    MongooseModule.forFeature([
                        {name: ModelName.CLAN, schema: ClanSchema},
                        {name: ModelName.JOIN, schema: joinSchema},
                        {name: ModelName.PLAYER, schema: PlayerSchema}
                    ]),

                    ClanInventoryModule,
                    RequestHelperModule
                ],
                providers: [
                    ClanService, isClanExists, PlayerCounterFactory, ClanHelperService,
                    JoinService
                ]
            }).compile();

        return ClanCommonModule.module;
    }
}