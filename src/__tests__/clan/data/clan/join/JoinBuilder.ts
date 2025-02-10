import {Join} from "../../../../../clan/join/join.schema";

export default class JoinBuilder {
    private readonly base: Partial<Join> = {
        player_id: undefined,
        clan_id: undefined,
        join_message: 'default message',
        accepted: false,
        _id: undefined
    };

    build(): Join {
        return { ...this.base } as Join;
    }

    setPlayerId(playerId: string) {
        this.base.player_id = playerId;
        return this;
    }

    setClanId(clanId: string) {
        this.base.clan_id = clanId;
        return this;
    }

    setJoinMessage(joinMessage: string) {
        this.base.join_message = joinMessage;
        return this;
    }

    setAccepted(accepted: boolean) {
        this.base.accepted = accepted;
        return this;
    }

    setId(id: string) {
        this.base._id = id;
        return this;
    }
}