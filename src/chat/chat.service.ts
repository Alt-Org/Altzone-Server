import {Injectable} from "@nestjs/common";
import {Document, Model, MongooseError, Types} from "mongoose";
import {Chat, ChatDocument} from "./chat.schema";
import {InjectModel} from "@nestjs/mongoose";
import {RequestHelperService} from "../requestHelper/requestHelper.service";
import {IgnoreReferencesType} from "../common/type/ignoreReferences.type";
import {ModelName} from "../common/enum/modelName.enum";
import {
    AddBasicService,
    ClearCollectionReferences,
} from "../common/base/decorator/AddBasicService.decorator";
import {IBasicService} from "../common/base/interface/IBasicService";
import {BasicServiceDummyAbstract} from "../common/base/abstract/basicServiceDummy.abstract";
import {CreateMessageDto} from "./dto/createMessage.dto";
import {IGetAllQuery} from "../common/interface/IGetAllQuery";
import {UpdateMessageDto} from "./dto/updateMessage.dto";
import {IResponseShape} from "../common/interface/IResponseShape";

@Injectable()
@AddBasicService()
export class ChatService extends BasicServiceDummyAbstract<Chat> implements IBasicService<Chat>{
    public constructor(
        @InjectModel(Chat.name) public readonly model: Model<Chat>,
        private readonly requestHelperService: RequestHelperService
    ){
        super();
        this.refsInModel = [];
        this.modelName = ModelName.CHAT;
    }

    public readonly refsInModel: ModelName[];
    public readonly modelName: ModelName;

    public createMessage = async (chat_id: string, input: CreateMessageDto): Promise<boolean | MongooseError> => {
        const chat = await this.getChat(chat_id);
        if(!chat)
            return false;

        chat.messages.push(input);
        chat.markModified('messages');
        const createResp = await chat.save();

        if(!createResp || !(createResp instanceof Document))
            return false;

        return true;
    }
    public readOneMessageById = async (chat_id: string, _id: string): Promise<IResponseShape<Chat> | null | MongooseError> => {
        const chat = await this.getChat(chat_id);
        if(!chat)
            return null;
    }
    public readAllMessages = async (chat_id: string, query: IGetAllQuery): Promise<IResponseShape<Chat> | null | MongooseError> => {
        return null;
    }
    public updateOneMessageById = async (chat_id: string, input: UpdateMessageDto): Promise<boolean | MongooseError> => {
        return null;
    }
    public deleteOneMessageById = async (chat_id: string, _id: string): Promise<boolean | MongooseError> => {
        return null;
    }

    public clearCollectionReferences: ClearCollectionReferences = async (_id: Types.ObjectId, ignoreReferences?: IgnoreReferencesType): Promise<void> => {
    }

    private configureResponse = (data: any): IResponseShape => {
        const dataKey = this.modelName;
        const dataType = Array.isArray(data) ? 'Array' : 'Object';
        const dataCount = dataType === 'Array' ? data.length : 1;

        return {
            data: {
                [dataKey]: data
            },
            metaData: {
                dataKey: dataKey,
                modelName: this.modelName,
                dataType,
                dataCount
            }
        }
    }

    private getChat = async (_id: string): Promise<ChatDocument | null> => {
        const chat = await this.model.findById(_id);

        if(!chat || !(chat instanceof Document))
            return null;

        return chat;
    }

}