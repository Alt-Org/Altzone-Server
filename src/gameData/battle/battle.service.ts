import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Battle, BattleDocument } from './schema/battle.schema';
import { StartBattleDto } from './dto/startBattle.dto';
import { BattleResultDto } from './dto/battleResult.dto';
import { BattleStatus } from './enum/battleStatus.enum';

@Injectable()
export class BattleService {
  constructor(
    @InjectModel(Battle.name) private battleModel: Model<BattleDocument>,
  ) {}

  /**
   * Initializes a new battle record in the database.
   * Sets the initial status to OPEN.
   * * @param dto - The data required to start a battle, including matchId and teams.
   * @returns A promise resolving to the created Battle document.
   */
  async registerBattle(dto: StartBattleDto): Promise<BattleDocument> {
    const newBattle = new this.battleModel({
      ...dto,
      status: BattleStatus.OPEN,
    });
    return newBattle.save();
  }

  /**
   * Processes a result claim from a player.
   * If results from both teams match, the battle is marked COMPLETED.
   * If results conflict, the battle enters PROCESSING and triggers a timeout-based resolution.
   * * @param dto - The result payload containing matchId, winning team, and duration.
   * @param playerId - The ID of the player submitting the result.
   * @returns A promise resolving to the updated Battle document.
   * @throws Error if the matchId is not found in the database.
   */
  async handleBattleResult(dto: BattleResultDto, playerId: string) {
    const battle = await this.battleModel.findOne({ matchId: dto.matchId });
    if (!battle) throw new Error('Match not found');

    battle.receivedResults.push({
      playerId,
      winnerTeam: dto.result,
      duration: dto.duration,
    });

    if (battle.receivedResults.length >= 2) {
      const results = battle.receivedResults.map(r => r.winnerTeam);
      const allMatch = results.every(val => val === results[0]);

      if (allMatch) {
        battle.status = BattleStatus.COMPLETED;
        battle.finalWinner = results[0];
        await battle.save();
        return await this.generateRaidTokens(battle);
      } else {
        battle.status = BattleStatus.PROCESSING;
        this.startFinalCallTimer(battle.matchId);
      }
    } else {
      battle.status = BattleStatus.OPEN;
    }

    return await battle.save();
  }

  /**
   * Triggers the "Final Call" timer for conflicting battle results.
   * Waits for 2 minutes before forcibly resolving the conflict.
   * * @param matchId - The unique identifier for the match in conflict.
   * @private
   */
  private startFinalCallTimer(matchId: string) {
    setTimeout(() => {
      this.resolveConflict(matchId);
    }, 120000);
  }

  /**
   * Distributes rewards (Raid Tokens) to the members of the winning team.
   * This method is triggered only when a final winner has been determined.
   * * @param battle - The validated Battle document with a set finalWinner.
   * @returns A promise resolving to the saved Battle document after reward distribution.
   * @private
   */
  private async generateRaidTokens(battle: BattleDocument) {
    const winners = (battle.finalWinner === 1 ? battle.team1 : battle.team2) || [];
    
    return await battle.save();
  }

  /**
   * Forcibly resolves a battle conflict after the "Final Call" period.
   * Uses a majority vote based on received results; defaults to Team 1 if tied.
   * * @param matchId - The unique identifier of the battle to resolve.
   * @returns A promise that resolves once the conflict is settled and rewards are issued.
   * @private
   */
  private async resolveConflict(matchId: string) {
    const battle = await this.battleModel.findOne({ matchId });
    if (!battle || battle.status === BattleStatus.COMPLETED) return;

    const results = battle.receivedResults;
    const team1Votes = results.filter(r => r.winnerTeam === 1).length;
    const team2Votes = results.filter(r => r.winnerTeam === 2).length;

    const finalWinner = team2Votes > team1Votes ? 2 : 1;

    battle.status = BattleStatus.COMPLETED;
    battle.finalWinner = finalWinner;
    await battle.save();
    
    await this.generateRaidTokens(battle);
  }
}