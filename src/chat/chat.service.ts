import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {} from '../common/base/decorator/AddBasicService.decorator';
import { ChatMessage } from './schema/chatMessage.schema';
import { Model } from 'mongoose';
import BasicService from '../common/service/basicService/BasicService';
import { ChatMessageDto } from './dto/chatMessage.dto';
import { CreateChatMessageDto } from './dto/createMessage.dto';
import {
  IServiceReturn,
  TIServiceReadManyOptions,
} from '../common/service/basicService/IService';

@Injectable()
export class ChatService {
  public constructor(
    @InjectModel(ChatMessage.name)
    public readonly model: Model<ChatMessage>,
  ) {
    this.basicService = new BasicService(model);
  }

  private readonly basicService: BasicService;

  async createChatMessage(message: CreateChatMessageDto) {
    return this.basicService.createOne<CreateChatMessageDto, ChatMessageDto>(
      message,
    );
  }

  async addReaction(
    messageId: string,
    playerName: string,
    emoji: string,
  ): Promise<IServiceReturn<ChatMessageDto>> {
    const [message, error] =
      await this.basicService.readOneById<ChatMessageDto>(messageId);

    if (error) return [null, error];

    message.reactions = (message.reactions || []).filter(
      (r) => r.playerName !== playerName,
    );

    if (emoji) message.reactions.push({ playerName, emoji });

    const [, updateError] = await this.basicService.updateOneById(
      message.id,
      message,
    );

    if (updateError) return [null, updateError];

    return [message, null];
  }

  async getMessages(options?: TIServiceReadManyOptions): Promise<{
    data: any[];
    paginationData: { itemCount: number };
    metaData: { dataType: string };
  }> {
    const [items, itemCount] = await Promise.all([
      this.model
        .find(options.filter)
        .sort(options.sort)
        .skip(options.skip)
        .limit(options.limit)
        .select(options.select ? options.select.join(' ') : '')
        .lean(),
      this.model.countDocuments(options.filter),
    ]);

    return {
      data: items,
      paginationData: { itemCount },
      metaData: { dataType: 'Array' },
    };
  }
}
