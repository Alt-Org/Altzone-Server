import {Injectable} from "@nestjs/common";
import {Model, MongooseError, Types} from "mongoose";
import {InjectModel} from "@nestjs/mongoose";
import {Profile, ProfileDocument} from "./profile.schema";
import {RequestHelperService} from "../requestHelper/requestHelper.service";
import {IgnoreReferencesType} from "../common/type/ignoreReferences.type";
import {ModelName} from "../common/enum/modelName.enum";
import {PlayerService} from "../player/player.service";
import {AddBasicService} from "../common/base/decorator/AddBasicService.decorator";
import {BasicServiceDummyAbstract} from "../common/base/abstract/basicServiceDummy.abstract";
import {IBasicService} from "../common/base/interface/IBasicService";
import * as argon2 from 'argon2';
import {envVars} from "../common/service/envHandler/envVars";
import ServiceError from "../common/service/basicService/ServiceError";
import {SEReason} from "../common/service/basicService/SEReason";
import BasicService from "../common/service/basicService/BasicService";
import {CreateProfileDto} from "./dto/createProfile.dto";
import {ProfileDto} from "./dto/profile.dto";

const ARGON2_CONFIG = {
    type: argon2.argon2id,
    memoryCost: parseInt(envVars.PSW_MEMORY),
    timeCost: parseInt(envVars.PSW_TIME),
    parallelism: parseInt(envVars.PSW_PARALLELISM)
};

@Injectable()
@AddBasicService()
export class ProfileService extends BasicServiceDummyAbstract<ProfileDocument> implements IBasicService<ProfileDocument> {
    public constructor(
        @InjectModel(Profile.name) public readonly model: Model<Profile>,
        private readonly playerService: PlayerService,
        private readonly requestHelperService: RequestHelperService
    ) {
        super();
        this.refsInModel = [ModelName.PLAYER];
        this.modelName = ModelName.PROFILE;
        this.basicService = new BasicService(model);
    }

    public readonly refsInModel: ModelName[];
    public readonly modelName: ModelName;
    public readonly basicService: BasicService;

    /**
     * Creates a new Profile in DB with hashed password.
     *
     * @param profile - The Profile data to create.
     * @returns  created Profile or an array of service errors if any occurred.
     */
    async createWithHashedPassword(profile: CreateProfileDto): Promise<[ProfileDto | null, ServiceError[] | null]> {
        const [hashedPassword, errors] = await this.hashPassword(profile.password);

        if(errors)
            return [ null, errors ];

        return this.basicService.createOne<CreateProfileDto, ProfileDto>({...profile, password: hashedPassword});
    }

    public clearCollectionReferences = async (_id: Types.ObjectId, ignoreReferences?: IgnoreReferencesType): Promise<void> => {
        await this.playerService.deleteByCondition({profile_id: _id}, {isOne: true});
    }

    /**
     * Hash the provided password
     * @param password password to hash
     * @return hashed password if everything is ok, or ServiceError if it could not be hashed
     */
    private async hashPassword(password: string): Promise<[string | null, ServiceError[] | null]> {
        try {
            const hashedPassword = await argon2.hash(password, ARGON2_CONFIG);
            return [ hashedPassword, null ];
        } catch (error) {
            return [
                null,
                [
                    new ServiceError({
                        reason: SEReason.UNEXPECTED,
                        message: 'Could not hash the provided password',
                        additional: error
                    })
                ]
            ];
        }
    }
}