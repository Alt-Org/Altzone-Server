import {Test, TestingModule} from '@nestjs/testing';
import {MongooseModule} from '@nestjs/mongoose';
import {ModelName} from '../../../common/enum/modelName.enum';
import {mongooseOptions, mongoString} from '../../test_utils/const/db';
import {BoxSchema} from "../../../box/schemas/box.schema";
import {GroupAdminSchema} from "../../../box/groupAdmin/groupAdmin.schema";
import {BoxService} from "../../../box/box.service";
import {GroupAdminService} from "../../../box/groupAdmin/groupAdmin.service";


export default class BoxCommonModule {
    private constructor() {
    }

    private static module: TestingModule;

    static async getModule() {
        if (!BoxCommonModule.module)
            BoxCommonModule.module = await Test.createTestingModule({
                imports: [
                    MongooseModule.forRoot(mongoString, mongooseOptions),
                    MongooseModule.forFeature([
                        { name: ModelName.BOX, schema: BoxSchema },
                        { name: ModelName.GROUP_ADMIN, schema: GroupAdminSchema }
                    ]),

                ],
                providers: [
                    BoxService, GroupAdminService
                ]
            }).compile();

        return BoxCommonModule.module;
    }
}