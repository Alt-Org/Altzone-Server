import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import BasicService from "../common/service/basicService/BasicService";
import { CreateVotingDto } from "./dto/createVoting.dto";
import { ItemVoteChoice } from "./enum/choiceType.enum";
import VotingNotifier from "./voting.notifier";
import { StartItemVotingParams } from "./type/startItemVoting.type";
import { Voting } from "./schemas/voting.schema";
import { VotingDto } from "./dto/voting.dto";
import ServiceError from "../common/service/basicService/ServiceError";
import { PlayerService } from "../player/player.service";

@Injectable()
export class VotingService {
	constructor(
		@InjectModel(Voting.name) public readonly model: Model<Voting>,
		private readonly notifier: VotingNotifier,
		private readonly playerService: PlayerService
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
		return this.basicService.createOne<CreateVotingDto, VotingDto>(voting);
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
	async startItemVoting(
		params: StartItemVotingParams
	): Promise<[VotingDto, ServiceError[]]> {
		const { playerId, itemId, clanId, type } = params;

		const newVoting: CreateVotingDto = {
			organizer: { player_id: playerId, clan_id: clanId },
			type: type,
			entity_id: itemId,
		};

		const newVote = {
			player_id: playerId,
			choice: ItemVoteChoice.YES,
		};

		newVoting.votes = [newVote];

		const [voting, errors] = await this.createOne(newVoting);
		if (errors) return [null, errors];

		this.notifier.newVoting(clanId, voting);
		return [voting, null];
	}

	/**
	 * Checks if the voting has been successful.
	 *
	 * @param voting - The voting data to check.
	 * @returns A boolean indicating whether the voting has been successful.
	 */
	async checkVotingSuccess(voting: VotingDto) {
		const yesVotes = voting.votes.filter(
			(vote) => vote.choice === ItemVoteChoice.YES
		).length;
		const totalVotes = voting.votes.length;
		const yesPercentage = (yesVotes / totalVotes) * 100;

		return yesPercentage >= voting.minPercentage;
	}

	/**
	 * Reads a voting from DB by id and checks if user has permission to view it.
	 *
	 * @param votingId - The ID of the voting to fetch.
	 * @param playerId - The ID of the player.
	 *
	 * @returns The voting entry if the user has permission to view it, otherwise null.
	 * @throws Will throw if there is an error reading from DB.
	 */
	async getVoting(votingId: string, playerId: string) {
		const [voting, errors] = await this.basicService.readOneById<VotingDto>(
			votingId
		);
		if (errors) throw errors;

		if (!voting.organizer.clan_id) return voting;

		const clanId = await this.playerService.getPlayerClanId(playerId);
		if (clanId === voting.organizer.clan_id) return voting;

		return null;
	}
}
