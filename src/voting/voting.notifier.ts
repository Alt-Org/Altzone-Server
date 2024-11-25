import { APIError } from "../common/controller/APIError";
import { NotificationGroup } from "../common/service/notificator/enum/NotificationGroup.enum";
import { NotificationResource } from "../common/service/notificator/enum/NotificationResource.enum";
import { NotificationStatus } from "../common/service/notificator/enum/NotificationStatus.enum";
import NotificationSender from "../common/service/notificator/NotificationSender";
import { VotingType } from "./enum/VotingType.enum";
import { Voting } from "./voting.schema";

export default class VotingNotifier {
	private readonly group = NotificationGroup.CLAN;
	private readonly resource = NotificationResource.VOTING;

	newVoting(clan_id: string, voting: Voting) {
		NotificationSender.buildNotification<Voting>()
			.addGroup(this.group, clan_id)
			.addResource(this.resource, voting.type)
			.send(NotificationStatus.NEW, voting);
	}

	votingUpdated(clan_id: string, voting: Voting) {
		NotificationSender.buildNotification<Voting>()
			.addGroup(this.group, clan_id)
			.addResource(this.resource, voting.type)
			.send(NotificationStatus.UPDATE, voting);
	}

	votingError(clan_id: string, votingType: VotingType, error: APIError) {
		NotificationSender.buildNotification<APIError>()
			.addGroup(this.group, clan_id)
			.addResource(this.resource, votingType)
			.send(NotificationStatus.ERROR, error);
	}

	votingCompleted(clan_id: string, voting: Voting) {
		NotificationSender.buildNotification<Voting>()
			.addGroup(this.group, clan_id)
			.addResource(this.resource, voting.type)
			.send(NotificationStatus.END, voting);
	}
}
