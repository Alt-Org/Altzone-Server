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
import { UpdateChatMessageDto } from '../dto/updateChatMessage.dto';
import ServiceError from 'src/common/service/basicService/ServiceError';
import { SEReason } from 'src/common/service/basicService/SEReason';
import { cancelTransaction } from '../../common/function/cancelTransaction';

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
      message._id,
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

  /**
   * Updates a ChatMessage by its _id in DB. The _id field is read-only and must be found from the parameter
   *
   * @param chat - The data needs to be updated of the ChatMessage.
   * @returns _true_ if ChatMessage was updated successfully, _false_ if nothing was updated for the ChatMessage,
   * or a ServiceError:
   * - NOT_FOUND if the ChatMessage was not found
   * - REQUIRED if _id is not provided
   */
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
      _id as any,
      fieldsToUpdate,
    );

    return [isSuccess, errors];
  }

  /**
   * Deletes the chatmessage.
   *
   * @param chatId - The ID of the chatmessage to delete.
   * @returns void promise.
   * @throws Will throw an error if the deletion fails.
   */
  async deleteChatMessage(chatId: string) {
    const session = await this.model.db.startSession();
    session.startTransaction();

    const [, deleteChatMessageError] =
      await this.basicService.deleteOneById(chatId);
    if (deleteChatMessageError)
      return await cancelTransaction(session, deleteChatMessageError);

    session.commitTransaction();
    session.endSession();
  }
}
