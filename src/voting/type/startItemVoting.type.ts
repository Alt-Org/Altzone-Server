import { VotingType } from "../enum/VotingType.enum";

export type StartItemVotingParams = {
	playerId: string;
	itemId: string;
	clanId: string;
	type: VotingType.BUYING_ITEM | VotingType.SELLING_ITEM;
};
