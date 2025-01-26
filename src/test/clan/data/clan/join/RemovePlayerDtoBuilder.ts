import IDataBuilder from "../../../../test_utils/interface/IDataBuilder";
import {RemovePlayerDTO} from "../../../../../clan/join/dto/removePlayer.dto";

export default class RemovePlayerDtoBuilder implements IDataBuilder<RemovePlayerDTO> {
    private readonly base: RemovePlayerDTO = {
        player_id: undefined
    };

    build() {
        return { ...this.base };
    }

    setPlayerId(player_id: string) {
        this.base.player_id = player_id;
        return this;
    }
}