import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Voting } from "./voting.schema";
import { Model } from "mongoose";
import BasicService from "../common/service/basicService/BasicService";
import { CreateVotingDto } from "./dto/createVoting.dto";
import { ItemVoteChoice } from "./enum/choiceType.enum";
import VotingNotifier from "./voting.notifier";
import { StartItemVotingParams } from "./type/startItemVoting.type";

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
	 * @param params - The parameters for starting the item voting.
	 * @param playerId - The ID of the player initiating the voting.
	 * @param itemId - The ID of the item being voted on.
	 * @param clanId - The ID of the clan associated with the voting.
	 * @param type - The type of voting, either for selling or buying an item.
	 *
	 * @throws - Throws an error if validation fails or if there are errors creating the voting.
	 */
	async startItemVoting(params: StartItemVotingParams) {
		const { playerId, itemId, clanId, type } = params;

		const newVoting: CreateVotingDto = {
			organizer_id: playerId,
			type: type,
			entity_id: itemId,
		};

		const newVote = {
			player_id: playerId,
			choice: ItemVoteChoice.YES,
		};

		newVoting.player_ids = [playerId];
		newVoting.votes = [newVote];

		const [voting, errors] = await this.createOne(newVoting);
		if (errors) throw errors;

		this.notifier.newVoting(clanId, voting);
	}
}