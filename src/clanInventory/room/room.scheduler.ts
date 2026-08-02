import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RoomService } from './room.service';
import { RoomStatus } from './enum/roomStatus.enum';
import { StockService } from '../stock/stock.service';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { SoulHomeService } from '../soulhome/soulhome.service';
import { ItemService } from '../item/item.service';
import { SoulHomeDto } from '../soulhome/dto/soulhome.dto';
import { endTransaction, initializeSession, cancelTransaction } from '../../common/function/Transactions';
import RoomRemovalNotifier from './roomRemoval.notifier';
import ServiceError from '../../common/service/basicService/ServiceError';
import { SEReason } from '../../common/service/basicService/SEReason';

@Injectable()
export class RoomScheduler {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly roomService: RoomService,
    private readonly stockService: StockService,
    private readonly soulHomeService: SoulHomeService,
    private readonly itemService: ItemService,
    private readonly roomRemovalNotifier: RoomRemovalNotifier,
  ) {}
  
  /**
   * Delete inactive rooms past grace period and send items to storage
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async removeInactiveRooms() {
    const [session, initErrors] = await initializeSession(this.connection);
    if (initErrors) throw new Error('Failed to start session');

    try {
      const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const [rooms, roomsErrors] = await this.roomService.basicService.readMany({
        filter: { 
          roomStatus: RoomStatus.INACTIVE,
          deactivationTime: { $lt: cutoff }
        },
        session
      });

      if (rooms && !roomsErrors) {
        const soulHomeIds = rooms.map(room => room.soulHome_id);

        const [soulHomes, soulHomesErrors] = await this.soulHomeService.basicService.readMany({
          filter: { 
            _id: { $in: soulHomeIds } 
          },
          session
        });
        if (soulHomesErrors) throw new Error('Failed to read SoulHomes');

        const clanIds = soulHomes.map(home => home.clan_id);

        const [stocks, stocksErrors] = await this.stockService.basicService.readMany({
          filter: { 
            clan_id: { $in: clanIds } 
          },
          session
        });
        if (stocksErrors) throw new Error('Failed to read Stocks');

        const homeRoomsMap = new Map<string, string[]>();
        const clanHomesMap = new Map<string, SoulHomeDto>(
          soulHomes.map(home => [home.clan_id, home])
        );
        const stockRoomsMap = new Map<string, string[]>();
        const itemBulk = [];

        for (const room of rooms) {
          if (!homeRoomsMap.has(room.soulHome_id)) {
            homeRoomsMap.set(room.soulHome_id, []);
          }

          homeRoomsMap.get(room.soulHome_id).push(room._id);
        }

        for (const stock of stocks) {
          const home = clanHomesMap.get(stock.clan_id.toString());
          const roomIds = home ? homeRoomsMap.get(home._id.toString()) || [] : [];

          stockRoomsMap.set(stock._id, roomIds);
        }

        for (const [stockId, roomIds] of stockRoomsMap) {
          const [items,] = await this.itemService.basicService.readMany({
            filter: {
              room_id: { $in: roomIds },
            },
            session,
          });

          if (items)
            itemBulk.push({
              updateMany: {
                filter: {
                  room_id: { $in: roomIds }
                },
                update: { 
                  $set: {
                    stock_id: stockId,
                    room_id: null
                  }
                }
              }
            });
        }

        if (itemBulk.length > 0) {
          const [, updateItemsErrors] = await this.itemService.basicService.bulkWrite(
            itemBulk,
            { session }
          );
          if (updateItemsErrors) throw new Error('Failed to update Items');
        }

        const [, deleteRoomsErrors] = await this.roomService.basicService.deleteMany({
          filter: {
            _id: { $in: rooms.map(room => room._id) },
          },
          session
        });
        if (deleteRoomsErrors) throw new Error('Failed to delete Rooms');
      }

      await endTransaction(session);

      this.roomRemovalNotifier.roomRemoval();
    } catch (error) {
      await cancelTransaction(
        session, 
        [
          new ServiceError({
            reason: SEReason.UNEXPECTED,
            value: error,
          })
        ]
      );
      throw error;
    }
  }
}
