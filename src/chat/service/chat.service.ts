import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ChatMessage } from '../schema/chatMessage.schema';
import { Model } from 'mongoose';
import BasicService from '../../common/service/basicService/BasicService';
import { ChatMessageDto } from '../dto/chatMessage.dto';
import { CreateChatMessageDto } from '../dto/createMessage.dto';
import {
  IServiceReturn,
  TIServiceReadManyOptions,
} from '../../common/service/basicService/IService';
import { UpdateChatMessageDto } from '../dto/updateChatMessage.dto';
import ServiceError from '../../common/service/basicService/ServiceError';
import { SEReason } from '../../common/service/basicService/SEReason';

@Injectable()
export class ChatService {
  private readonly basicService: BasicService;
  public constructor(
    @InjectModel(ChatMessage.name)
    public readonly model: Model<ChatMessage>,
  ) {
    this.basicService = new BasicService(model);
  }

  async createChatMessage(message: CreateChatMessageDto) {
    return this.basicService.createOne<CreateChatMessageDto, ChatMessageDto>(
      message,
    );
  }

  /**
   * Adds a reaction to chat message.
   *
   * @param messageId - ID of the message reaction is to.
   * @param playerName - Name of the player who reacted.
   * @param emoji - String representation of the emoji.
   * @param sender_id - Unique ID of the player reacting.
   * @returns Message with added reaction.
   */
  async addReaction(
    messageId: string,
    playerName: string,
    emoji: string,
    sender_id: string,
  ): Promise<IServiceReturn<ChatMessageDto>> {
    const [message, error] =
      await this.basicService.readOneById<ChatMessageDto>(messageId);

    if (error) return [null, error];

    message.reactions = (message.reactions || []).filter(
      (r) => r.playerName !== playerName,
    );

    if (emoji) message.reactions.push({ playerName, emoji, sender_id });

    const [, updateError] = await this.basicService.updateOneById(
      message._id,
      message,
    );

    if (updateError) return [null, updateError];

    return [message, null];
  }

  async getMessages(
    options?: TIServiceReadManyOptions,
  ): Promise<IServiceReturn<ChatMessageDto[]>> {
    const opts = {
      ...options,
      populate: [{ path: 'sender' }],
    };
    return await this.basicService.readMany<ChatMessageDto>(opts);
  }

  async updateOneById(
    chat: Partial<UpdateChatMessageDto>,
  ): Promise<[boolean | null, ServiceError[] | null]> {
    if (!chat._id)
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.REQUIRED,
            field: '_id',
            value: chat._id,
            message: '_id field is required',
          }),
        ],
      ];

    const { _id, ...fieldsToUpdate } = chat;

    const [isSuccess, errors] = await this.basicService.updateOneById(
      _id,
      fieldsToUpdate,
    );

    return [isSuccess, errors];
  }

  async deleteChatMessageById(chatId: string): Promise<IServiceReturn<true>> {
    return await this.basicService.deleteOneById(chatId);
  }
}
