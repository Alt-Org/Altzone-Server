import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {ClanMetaSchema} from "./clanMeta.schema";
import {ClanMetaController} from "./clanMeta.controller";
import {ClanMetaService} from "./clanMeta.service";
import {ModelName} from "../../common/enum/modelName.enum";

@Module({
    imports: [
        //MongooseModule.forFeature([ {name: ModelName.CLAN_META, schema: ClanMetaSchema} ]),
    ],
    //controllers: [ClanMetaController],
    providers: [ ClanMetaService ],
    exports: [ClanMetaService]
})
export class ClanMetaModule {}