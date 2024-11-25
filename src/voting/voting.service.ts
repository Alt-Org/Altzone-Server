import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Voting } from "./voting.schema";
import { Model } from "mongoose";
import BasicService from "../common/service/basicService/BasicService";
import { CreateVotingDto } from "./dto/createVoting.dto";
import { ItemVoteChoice } from "./enum/choiceType.enum";
import { VotingType } from "./enum/VotingType.enum";
import { validate } from "class-validator";
import ServiceError from "../common/service/basicService/ServiceError";
import { SEReason } from "../common/service/basicService/SEReason";
import VotingNotifier from "./voting.notifier";

@Injectable()
export class VotingService {
	constructor(
		@InjectModel(Voting.name) public readonly model: Model<Voting>,
		private readonly notifier: VotingNotifier
	) {
		this.basicService = new BasicService(model);
	}

	public readonly basicService: BasicService;

	/**
	 * Creates a new voting entry.
	 *
	 * @param voting - The data transfer object containing the details of the voting to be created.
	 * @returns A promise that resolves to the created voting entity.
	 */
	async createOne(voting: CreateVotingDto) {
		return this.basicService.createOne<CreateVotingDto, Voting>(voting);
	}

	/**
	 * Initiates a new voting process for an item.
	 * Creates a new voting entry and sends a MQTT notification.
	 *
	 * @param playerId - The ID of the player initiating the voting.
	 * @param itemId - The ID of the item being voted on.
	 * @param clanId - The ID of the clan associated with the voting.
	 * @param type - The type of voting, either for selling or buying an item.
	 *
	 * @throws - Throws an error if validation fails or if there are errors creating the voting.
	 */
	async startItemVoting(
		playerId: string,
		itemId: string,
		clanId: string,
		type: VotingType.SELLING_ITEM | VotingType.BUYING_ITEM
	) {
		const newVoting: CreateVotingDto = {
			organizer_id: playerId,
			type: type,
			item_id: itemId,
		};

		if (type === VotingType.SELLING_ITEM) {
			const newVote = {
				player_id: playerId,
				choice: ItemVoteChoice.YES,
			};

			newVoting.player_ids = [playerId];
			newVoting.votes = [newVote];
		}

		const validationErrors = await validate(newVoting);
		if (validationErrors.length > 0) {
			console.error(validationErrors);
			throw new ServiceError({ reason: SEReason.VALIDATION });
		}

		const [voting, errors] = await this.createOne(newVoting);
		if (errors) throw errors;

		this.notifier.newVoting(clanId, voting);
	}
}
