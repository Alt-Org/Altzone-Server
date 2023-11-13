import {Injectable, InternalServerErrorException, NotFoundException} from "@nestjs/common";
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
import {IResponseShape} from "../common/interface/IResponseShape";
import {ObjectId} from "mongodb";

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
        const chat = await this.getChatOrThrowNotFoundError(chat_id);
        chat.messages.push(input);
        chat.markModified('messages');
        const createResp = await chat.save();
        if(!createResp || !(createResp instanceof Document))
            throw new InternalServerErrorException('Could not save the message');

        return true;
    }
    public readOneMessageById = async (chat_id: string, _id: number): Promise<IResponseShape<Chat> | null | MongooseError> => {
        const message = await this.model.aggregate([
            { $match: {_id : new ObjectId(chat_id)} },
            { $unwind: "$messages" },
            { $match: {'messages.id' : _id} },
            { $limit: 1 },
            { $project: {_id: 0, name: 0} },
            { $project: {
                id: '$messages.id',
                senderUsername: '$messages.senderUsername',
                content: '$messages.content',
                feeling: '$messages.feeling'
            }}
        ]);

        if(!message || message.length === 0)
            return null;

        return this.configureResponse(message[0]);
    }
    public readAllMessages = async (chat_id: string, query: IGetAllQuery): Promise<IResponseShape<Chat> | null | MongooseError> => {
        const {filter, sort, limit, skip} = query;

        const messagesFound = await this.model.aggregate([
            { $match: {_id : new ObjectId(chat_id)} },
            { $unwind: "$messages" },
            { $project: {_id: 0, name: 0} },
            { $project: {
                id: '$messages.id',
                senderUsername: '$messages.senderUsername',
                content: '$messages.content',
                feeling: '$messages.feeling'
            }},
            { $match: filter },
            { $count: "id"}
        ]);

        const data = await this.model.aggregate([
            { $match: {_id : new ObjectId(chat_id)} },
            { $unwind: "$messages" },
            { $project: {_id: 0, name: 0} },
            { $project: {
                id: '$messages.id',
                senderUsername: '$messages.senderUsername',
                content: '$messages.content',
                feeling: '$messages.feeling'
            }},
            { $match: filter },
            { $sort: sort },
            { $skip: skip || 0 },
            { $limit: limit }
        ]);

        let resp = this.configureResponse(data) as any;
        if(messagesFound && messagesFound.length !== 0){
            resp.paginationData = {};
            resp.paginationData.itemCount = messagesFound[0].id;
        }

        return resp;
    }
    // public updateOneMessageById = async (chat_id: string, input: UpdateMessageDto): Promise<boolean | MongooseError> => {
    //     const resp = await this.model.findOneAndUpdate({_id: chat_id}, {$set: input});
    //     console.log('resp', resp);
    //     return null;
    // }
    // public deleteOneMessageById = async (chat_id: string, _id: string): Promise<boolean | MongooseError> => {
    //     return null;
    // }

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

    private getChatOrThrowNotFoundError = async (_id: string): Promise<ChatDocument> => {
        const chat = await this.model.findById(_id);

        if(!chat || !(chat instanceof Document))
            throw new NotFoundException(`Chat with _id ${_id} not found`);

        return chat;
    }

}