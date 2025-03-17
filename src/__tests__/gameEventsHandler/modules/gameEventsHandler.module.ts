import {PlayerEventHandler} from "../../../gameEventsHandler/playerEventHandler";
import {ClanEventHandler} from "../../../gameEventsHandler/clanEventHandler";
import {GameEventsHandler} from "../../../gameEventsHandler/gameEventsHandler";
import GameEventsHandlerCommonModule from "./gameEventsHandlerCommon";

export default class GameEventsHandlerModule {
    private constructor() {}

    static async getPlayerEventHandler(){
        const module = await GameEventsHandlerCommonModule.getModule();
        return await module.resolve(PlayerEventHandler);
    }

    static async getClanEventHandler(){
        const module = await GameEventsHandlerCommonModule.getModule();
        return await module.resolve(ClanEventHandler);
    }

    static async getGameEventsHandler(){
        const module = await GameEventsHandlerCommonModule.getModule();
        return await module.resolve(GameEventsHandler);
    }
}
