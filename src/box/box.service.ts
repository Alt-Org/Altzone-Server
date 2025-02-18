import {Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {Model, MongooseError} from "mongoose";
import {Box, BoxDocument, publicReferences} from "./schemas/box.schema";
import BasicService, {convertMongooseToServiceErrors} from "../common/service/basicService/BasicService";
import {BoxReference} from "./enum/BoxReference.enum";
import {IServiceReturn, TReadByIdOptions} from "../common/service/basicService/IService";
import {BoxHelper} from "./util/boxHelper";
import {ClanService} from "../clan/clan.service";
import {ChatService} from "../chat/chat.service";
import ServiceError from "../common/service/basicService/ServiceError";
import {ProfileService} from "../profile/profile.service";
import {GroupAdmin} from "./groupAdmin/groupAdmin.schema";
import {Player} from "../player/player.schema";
import {Clan} from "../clan/clan.schema";
import {Room} from "../clanInventory/room/room.schema";

@Injectable()
export class BoxService {
    public constructor(
        @InjectModel(Box.name) public readonly model: Model<Box>,
        @InjectModel(Player.name) public readonly playerModel: Model<Player>,
        @InjectModel(Clan.name) public readonly clanModel: Model<Clan>,
        @InjectModel(Room.name) public readonly roomModel: Model<Room>,
        @InjectModel(GroupAdmin.name) public readonly groupAdminModel: Model<GroupAdmin>,
        private readonly boxHelper: BoxHelper,
        private readonly clanService: ClanService,
        private readonly chatService: ChatService,
        private readonly profilesService: ProfileService
    ) {
        this.refsInModel = publicReferences;
        this.basicService = new BasicService(model);
    }

    public readonly refsInModel: BoxReference[];
    private readonly basicService: BasicService;


    /**
     * Creates a new box
     * @param box box to create
     * @returns created box on success or ServiceErrors:
     *
     * - REQUIRED if the provided input is null or undefined
     * - NOT_FOUND if any of the resources not found: profiles, players, clans, soul homes, stocks, rooms, chat
     * - NOT_UNIQUE if a box with provided admin password already exists
     * - validation errors if input is invalid
     */
    public async createOne(box: Box): Promise<IServiceReturn<BoxDocument>> {
        const [isBoxValid, validationErrors] = await this.boxHelper.validateBox(box);

        if (validationErrors)
            return [null, validationErrors];

        return this.basicService.createOne(box);
    }

    /**
     * Reads a Box by its _id in DB.
     *
     * @param _id - The Mongo _id of the Box to read.
     * @param options - Options for reading the Box.
     * @returns Box with the given _id on succeed or an array of ServiceErrors if any occurred.
     */
    async readOneById(_id: string, options?: TReadByIdOptions) {
        let optionsToApply = options;
        if(options?.includeRefs)
            optionsToApply.includeRefs = options.includeRefs.filter((ref: any) => publicReferences.includes(ref));

        return this.basicService.readOneById<BoxDocument>(_id, optionsToApply);
    }

    /**
     * Removes box data from DB and its references
     * @param _id _id of the box to be removed
     *
     * @returns true if box data was removed successfully or ServiceErrors if any occurred
     */
    public async deleteOneById(_id: string): Promise<IServiceReturn<true>> {
        const [boxToRemove, boxReadErrors] = await this.basicService.readOneById<BoxDocument>(_id);
        if(boxReadErrors)
            return [null, boxReadErrors];

        const [isSuccess, boxRefRemoveErrors] = await this.deleteBoxReferences(boxToRemove.toObject());
        if(boxRefRemoveErrors)
            return [null, boxRefRemoveErrors];

        return this.basicService.deleteOneById(_id);
    }

    /**
     * Removes all data associated with the box including:
     * - clans and their soul homes, rooms, stocks
     * - profiles and players
     * - chat
     *
     * @param boxData box related data to be removed
     *
     * @returns true if references were removed or Service errors if any occurred
     */
    public async deleteBoxReferences(boxData: Partial<Box>): Promise<IServiceReturn<true>> {
        const errors: ServiceError[] = [];
        if (boxData.clan_ids) {
            for (let i = 0; i < boxData.clan_ids.length; i++) {
                const [isRemoved, deleteErrors] = await this.clanService.deleteOneById(boxData.clan_ids[i].toString());
                if (deleteErrors)
                    errors.push(...deleteErrors);
            }
        }

        if (boxData.chat_id) {
            const resp = await this.chatService.deleteOneById(boxData.chat_id.toString());
            if (resp instanceof MongooseError) {
                const deleteError = convertMongooseToServiceErrors(resp);
                errors.push(...deleteError);
            }
        }

        if (boxData.adminProfile_id) {
            const resp = await this.profilesService.deleteOneById(boxData.adminProfile_id.toString());
            if (resp instanceof MongooseError) {
                const deleteError = convertMongooseToServiceErrors(resp);
                errors.push(...deleteError);
            }
        }

        if (boxData.testers) {
            const testerProfiles = boxData.testers.map(tester => tester.profile_id);
            for (let i = 0; i < testerProfiles.length; i++) {
                const resp = await this.profilesService.deleteOneById(testerProfiles[i].toString());
                if (resp instanceof MongooseError) {
                    const deleteError = convertMongooseToServiceErrors(resp);
                    errors.push(...deleteError);
                }
            }
        }

        return errors.length === 0 ? [true, null] : [null, errors];
    }
}
