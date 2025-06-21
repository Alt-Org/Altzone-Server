import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {} from '../../common/base/decorator/AddBasicService.decorator';
import { ChatMessage } from '../schema/chatMessage.schema';
import { Model } from 'mongoose';
import BasicService from '../../common/service/basicService/BasicService';
import { ChatMessageDto } from '../dto/chatMessage.dto';
import { CreateChatMessageDto } from '../dto/createMessage.dto';
import {
  IServiceReturn,
  TIServiceReadManyOptions,
} from '../../common/service/basicService/IService';

@Injectable()
export class ChatService {
  public constructor(
    @InjectModel(ChatMessage.name)
    public readonly model: Model<ChatMessage>,
  ) {
    this.basicService = new BasicService(model);
  }

  private readonly basicService: BasicService;

  /**
   * Creates a message in database.
   *
   * @param message - Message data to create.
   * @returns Created message.
   */
  async createChatMessage(message: CreateChatMessageDto) {
    return this.basicService.createOne<CreateChatMessageDto, ChatMessageDto>(
      message,
    );
  }

  /**
   * Adds an reaction to chat message.
   *
   * @param messageId - ID of the message reaction is to.
   * @param playerName - Name of the player who reacted.
   * @param emoji - String representation of the emoji.
   * @returns Message with added reaction.
   */
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

  /**
   * Retrieves messages from database.
   *
   * @param options - Database query options.
   * @returns An array of chat messages.
   */
  async getMessages(
    options?: TIServiceReadManyOptions,
  ): Promise<IServiceReturn<ChatMessageDto[]>> {
    const opts = {
      ...options,
      populate: [{ path: 'sender' }],
    };
    return await this.basicService.readMany<ChatMessageDto>(opts);
  }
}
