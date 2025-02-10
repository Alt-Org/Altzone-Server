import { JoinRequestDto } from "../../../../clan_module/clan/join/dto/joinRequest.dto";
import IDataBuilder from "../../../test_utils/interface/IDataBuilder";

export default class JoinRequestDtoBuilder implements IDataBuilder<JoinRequestDto> {
    private readonly base: JoinRequestDto = {
        clan_id: undefined,
        player_id: undefined,
        join_message: 'default join message'
    };

    build() {
        return { ...this.base };
    }

    setClanId(clan_id: string) {
        this.base.clan_id = clan_id;
        return this;
    }

    setPlayerId(player_id: string) {
        this.base.player_id = player_id;
        return this;
    }

    setJoinMessage(join_message: string) {
        this.base.join_message = join_message;
        return this;
    }
}