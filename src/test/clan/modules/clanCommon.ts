import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { RequestHelperModule } from '../../../requestHelper/requestHelper.module';
import { PlayerSchema } from '../../../player/player.schema';
import { ModelName } from '../../../common/enum/modelName.enum';
import { ClanSchema } from '../../../clan_module/clan/clan.schema';
import { ClanService } from '../../../clan_module/clan/clan.service';
import { isClanExists } from '../../../clan_module/clan/decorator/validation/IsClanExists.decorator';
import { PlayerCounterFactory } from '../../../clan_module/clan/clan.counters';
import ClanHelperService from '../../../clan_module/clan/utils/clanHelper.service';
import { JoinService } from '../../../clan_module/clan/join/join.service';
import { mongooseOptions, mongoString } from '../../test_utils/const/db';
import {joinSchema} from "../../../clan/join/join.schema";
import {ClanInventoryModule} from "../../../clanInventory/clanInventory.module";


export default class ClanCommonModule {
    private constructor() {}

    private static module: TestingModule;

    static async getModule(){
        if(!ClanCommonModule.module)
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