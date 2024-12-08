import { APIError } from "../common/controller/APIError";
import { NotificationGroup } from "../common/service/notificator/enum/NotificationGroup.enum";
import { NotificationResource } from "../common/service/notificator/enum/NotificationResource.enum";
import { NotificationStatus } from "../common/service/notificator/enum/NotificationStatus.enum";
import NotificationSender from "../common/service/notificator/NotificationSender";
import { VotingDto } from "./dto/voting.dto";
import { VotingType } from "./enum/VotingType.enum";

/**
 * Class for sending voting notifications
 */
export default class VotingNotifier {
    private readonly group = NotificationGroup.CLAN;
    private readonly resource = NotificationResource.VOTING;

    /**
     * Sends a notification for a new voting
     * @param clan_id - The ID of the clan associated with the voting
     * @param voting - The voting details
     */
    newVoting(clan_id: string, voting: VotingDto) {
        NotificationSender.buildNotification<VotingDto>()
            .addGroup(this.group, clan_id)
            .addResource(this.resource, voting.type)
            .send(NotificationStatus.NEW, voting);
    }

    /**
     * Sends a notification for an updated voting
     * @param clan_id - The ID of the clan associated with the voting
     * @param voting - The updated voting details
     */
    votingUpdated(clan_id: string, voting: VotingDto) {
        NotificationSender.buildNotification<VotingDto>()
            .addGroup(this.group, clan_id)
            .addResource(this.resource, voting.type)
            .send(NotificationStatus.UPDATE, voting);
    }

    /**
     * Sends a notification for a voting error
     * @param clan_id - The ID of the clan associated with the voting
     * @param votingType - The type of voting
     * @param error - The error details
     */
    votingError(clan_id: string, votingType: VotingType, error: APIError) {
        NotificationSender.buildNotification<APIError>()
            .addGroup(this.group, clan_id)
            .addResource(this.resource, votingType)
            .send(NotificationStatus.ERROR, error);
    }

    /**
     * Sends a notification for a completed voting
     * @param clan_id - The ID of the clan associated with the voting
     * @param voting - The completed voting details
     */
    votingCompleted(clan_id: string, voting: VotingDto) {
        NotificationSender.buildNotification<VotingDto>()
            .addGroup(this.group, clan_id)
            .addResource(this.resource, voting.type)
            .send(NotificationStatus.END, voting);
    }
}
