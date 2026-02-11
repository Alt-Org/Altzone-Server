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
  TIServiceCreateOneOptions,
  TIServiceUpdateByIdOptions,
  TIServiceReadOneOptions,
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

  /**
   * Creates a message in the database.
   *
   * @param message - Message data to create.
   * @param options - Optional mongoose ClientSession for transaction support.
   * @returns Created message.
   */
  async createChatMessage(
    message: CreateChatMessageDto,
    options?: TIServiceCreateOneOptions,
  ) {
    return this.basicService.createOne<CreateChatMessageDto, ChatMessageDto>(
      message,
      options,
    );
  }

  /**
   * Adds a reaction to the chat message.
   *
   * @param messageId - ID of the message reaction is to.
   * @param playerName - Name of the player who reacted.
   * @param emoji - String representation of the emoji.
   * @param sender_id - Unique ID of the player reacting.
   * @param options - Optional mongoose ClientSession for transaction support.
   * @returns Message with added reaction.
   */
  async addReaction(
    messageId: string,
    playerName: string,
    emoji: string,
    sender_id: string,
    options?: TIServiceUpdateByIdOptions,
  ): Promise<IServiceReturn<ChatMessageDto>> {
    await this.model.updateOne(
      { _id: messageId },
      { $pull: { reactions: { playerName } } },
      options,
    );

    const update = emoji
      ? { $push: { reactions: { playerName, emoji, sender_id } } }
      : {};

    const updatedDoc = await this.model
      .findOneAndUpdate({ _id: messageId }, update, { new: true, ...options })
      .exec();

    if (!updatedDoc) {
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.NOT_FOUND,
            message: 'Msg not found',
          }),
        ],
      ];
    }

    return [updatedDoc as unknown as ChatMessageDto, null];
  }

  /**
   * Retrieves messages from the database.
   *
   * @param options - Optional mongoose ClientSession for transaction support.
   * @returns An array of chat messages.
   */
  async getMessages(
    options?: TIServiceReadManyOptions,
  ): Promise<IServiceReturn<ChatMessageDto[]>> {
    const opts = {
      ...options,
      populate: [{ path: 'sender' }],
    };
    const [messages, errors] =
      await this.basicService.readMany<ChatMessageDto>(opts);

    if (errors) return [null, errors];

    const cleanMessages = (messages || []).filter((msg) => msg !== null);

    return [cleanMessages, null];
  }

  /**
   * Updates a ChatMessage by its _id in the DB. The _id field is read-only and must be found from the parameter
   *
   * @param chat - The data needs to be updated of the ChatMessage.
   * @param options - Optional mongoose ClientSession for transaction support.
   * @returns _true_ if ChatMessage was updated successfully, _false_ if nothing was updated for the ChatMessage,
   * or a ServiceError:
   * - NOT_FOUND if the ChatMessage was not found
   * - REQUIRED if _id is not provided
   */
  async updateOneById(
    chat: Partial<UpdateChatMessageDto>,
    options?: TIServiceUpdateByIdOptions,
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
      options,
    );

    return [isSuccess, errors];
  }

  /**
   * Deletes the chatmessage.
   *
   * @param chatId - The ID of the chatmessage to delete.
   * @returns _true_ if ChatMessage was deleted successfully, _false_ if nothing was deleted
   * or a ServiceError:
   * - NOT_FOUND if the ChatMessage was not found
   * - REQUIRED if _id is not provided
   */
  async deleteChatMessageById(chatId: string): Promise<IServiceReturn<true>> {
    return await this.basicService.deleteOneById(chatId);
  }
}
