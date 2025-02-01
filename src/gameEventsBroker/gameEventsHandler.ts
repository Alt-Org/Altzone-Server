import { Injectable } from "@nestjs/common";
import { GameEvent } from "./enum/GameEvent.enum";
import ServiceError from "../common/service/basicService/ServiceError";
import { PlayerEventHandler } from "./playerEventHandler";
import { ClanEventHandler } from "./clanEventHandler";
import { PlayerEvent } from "../rewarder/playerRewarder/enum/PlayerEvent.enum";
import { TaskName } from "../dailyTasks/enum/taskName.enum";

@Injectable()
export class GameEventsHandler {
	constructor(
		private readonly playerEventHandler: PlayerEventHandler,
		private readonly clanEventHandler: ClanEventHandler
	){}

	async handleEvent(player_id: string, event: GameEvent) {
        switch (event) {
			case GameEvent.PLAYER_WIN_BATTLE:
				return this.handleWinBattle(player_id);
			case GameEvent.PLAYER_PLAY_BATTLE:
				return this.handlePlayBattle(player_id);
			case GameEvent.PLAYER_SEND_MESSAGE:
				return this.handleSendMessage(player_id);
			case GameEvent.PLAYER_VOTE:
				return this.handleVote(player_id);
			case GameEvent.PLAYER_START_VOTING:
				return this.handleStartVoting(player_id);
			case GameEvent.PLAYER_COLLECT_DIAMONDS:
				return this.handleCollectDiamonds(player_id);
			case GameEvent.PLAYER_START_BATTLE_NEW_CHARACTER:
				return this.handleNewCharacter(player_id);
		
			default:
				return [ null, [ new ServiceError({ message: 'The game event is not supported' }) ] ];
		}
    }

	private async handleWinBattle(player_id: string){
		const [ playerSuccess, playerErrors ] = await this.playerEventHandler.handlePlayerEvent(player_id, PlayerEvent.BATTLE_WON);
		const [ clanSuccess, clanErrors ] = await this.clanEventHandler.handlePlayerTask(player_id, TaskName.WIN_BATTLE);

		if(playerErrors || clanErrors)
			return [ null, this.concatArrays(playerErrors, clanErrors) ];

		return [ true, null ];
	}

	private async handlePlayBattle(player_id: string){
		const [ playerSuccess, playerErrors ] = await this.playerEventHandler.handlePlayerEvent(player_id, PlayerEvent.BATTLE_PLAYED);
		const [ clanSuccess, clanErrors ] = await this.clanEventHandler.handlePlayerTask(player_id, TaskName.PLAY_BATTLE);

		if(playerErrors || clanErrors)
			return [ null, this.concatArrays(playerErrors, clanErrors) ];

		return [ true, null ];
	}

	private async handleSendMessage(player_id: string){
		const [ playerSuccess, playerErrors ] = await this.playerEventHandler.handlePlayerEvent(player_id, PlayerEvent.MESSAGE_SENT);
		const [ clanSuccess, clanErrors ] = await this.clanEventHandler.handlePlayerTask(player_id, TaskName.WRITE_CHAT_MESSAGE);

		if(playerErrors || clanErrors)
			return [ null, this.concatArrays(playerErrors, clanErrors) ];

		return [ true, null ];
	}

	private async handleVote(player_id: string){
		const [ playerSuccess, playerErrors ] = await this.playerEventHandler.handlePlayerEvent(player_id, PlayerEvent.VOTE_MADE);
		const [ clanSuccess, clanErrors ] = await this.clanEventHandler.handlePlayerTask(player_id, TaskName.VOTE);

		if(playerErrors || clanErrors)
			return [ null, this.concatArrays(playerErrors, clanErrors) ];

		return [ true, null ];
	}

	private async handleStartVoting(player_id: string){
		const [ clanSuccess, clanErrors ] = await this.clanEventHandler.handlePlayerTask(player_id, TaskName.START_VOTING);

		if(clanErrors)
			return [ null, clanErrors ];

		return [ true, null ];
	}

	private async handleCollectDiamonds(player_id: string){
		const [ clanSuccess, clanErrors ] = await this.clanEventHandler.handlePlayerTask(player_id, TaskName.COLLECT_DIAMONDS);

		if(clanErrors)
			return [ null, clanErrors ];

		return [ true, null ];
	}

	private async handleNewCharacter(player_id: string){
		const [ clanSuccess, clanErrors ] = await this.clanEventHandler.handlePlayerTask(player_id, TaskName.START_BATTLE_NEW_CHARACTER);

		if(clanErrors)
			return [ null, clanErrors ];

		return [ true, null ];
	}

	private concatArrays(arr1?: any[], arr2?: any[]){
		const arr1Copy = arr1 ? arr1 : [];
		const arr2Copy = arr2 ? arr2 : [];
		return [ ...arr1Copy, ...arr2Copy ];
	}
}