import {Message} from "../../../../player/message.schema";
import {GameStatistics} from "../../../../player/gameStatistics.schema";

export default class GameStatisticsBuilder {
    private readonly base: Partial<GameStatistics> = {
        playedBattles: 0,
        wonBattles: 0,
        diamondsAmount: 0,
        startedVotings: 0,
        participatedVotings: 0,
        messages: [],
    };

    build() {
        return {...this.base} as GameStatistics;
    }

    setPlayedBattles(playedBattles: number) {
        this.base.playedBattles = playedBattles;
        return this;
    }

    setWonBattles(wonBattles: number) {
        this.base.wonBattles = wonBattles;
        return this;
    }

    setDiamondsAmount(diamondsAmount: number) {
        this.base.diamondsAmount = diamondsAmount;
        return this;
    }

    setStartedVotings(startedVotings: number) {
        this.base.startedVotings = startedVotings;
        return this;
    }

    setParticipatedVotings(participatedVotings: number) {
        this.base.participatedVotings = participatedVotings;
        return this;
    }

    setMessages(messages: Message[]) {
        this.base.messages = messages;
        return this;
    }

    addMessage(message: Message) {
        if (!this.base.messages) {
            this.base.messages = [];
        }
        this.base.messages.push(message);
        return this;
    }
}