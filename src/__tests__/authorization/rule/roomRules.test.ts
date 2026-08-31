import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Action } from '../../../authorization/enum/action.enum';
import { roomRules } from '../../../authorization/rule/roomRules';
import { RequestHelperService } from '../../../requestHelper/requestHelper.service';
import { RoomDto } from '../../../clanInventory/room/dto/room.dto';
import { UpdateRoomDto } from '../../../clanInventory/room/dto/updateRoom.dto';
import { SoulHomeDto } from '../../../clanInventory/soulhome/dto/soulhome.dto';
import { Player } from '../../../player/schemas/player.schema';
import AuthBuilderFactory from '../../auth/data/authBuilderFactory';

describe('roomRules() test suite', () => {
  const userBuilder = AuthBuilderFactory.getBuilder('User');

  const roomId = 'room-id';
  const soulHomeId = 'soulhome-id';
  const playerId = 'player-id';
  const clanId = 'clan-a-id';
  const otherClanId = 'clan-b-id';

  const user = userBuilder.setPlayerId(playerId).build();

  let requestHelperService: RequestHelperService;
  let getModelInstanceById: jest.Mock;

  beforeEach(() => {
    getModelInstanceById = jest.fn();
    requestHelperService = {
      getModelInstanceById,
    } as any;
  });

  it('Should allow read actions without checking room ownership', async () => {
    const ability = await roomRules(
      user,
      RoomDto,
      Action.read,
      null,
      requestHelperService,
    );

    expect(ability.can(Action.read_request, RoomDto)).toBe(true);
    expect(ability.can(Action.read_response, RoomDto)).toBe(true);
    expect(getModelInstanceById).not.toHaveBeenCalled();
  });

  it('Should allow create actions without checking room ownership', async () => {
    const ability = await roomRules(
      user,
      UpdateRoomDto,
      Action.create,
      null,
      requestHelperService,
    );

    expect(ability.can(Action.create_request, UpdateRoomDto)).toBe(true);
    expect(getModelInstanceById).not.toHaveBeenCalled();
  });

  it('Should throw NotFoundException if the room does not exist', async () => {
    getModelInstanceById.mockResolvedValueOnce(null);

    await expect(
      roomRules(
        user,
        UpdateRoomDto,
        Action.update,
        { _id: roomId } as any,
        requestHelperService,
      ),
    ).rejects.toThrow(NotFoundException);
  });

  it("Should throw ForbiddenException if the room's SoulHome does not exist", async () => {
    getModelInstanceById
      .mockResolvedValueOnce({
        _id: roomId,
        soulHome_id: soulHomeId,
      } as Partial<RoomDto>)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ clan_id: clanId } as Partial<Player>);

    await expect(
      roomRules(
        user,
        UpdateRoomDto,
        Action.update,
        { _id: roomId } as any,
        requestHelperService,
      ),
    ).rejects.toThrow(ForbiddenException);
  });

  it('Should throw ForbiddenException if the logged-in player does not belong to any Clan', async () => {
    getModelInstanceById
      .mockResolvedValueOnce({
        _id: roomId,
        soulHome_id: soulHomeId,
      } as Partial<RoomDto>)
      .mockResolvedValueOnce({
        _id: soulHomeId,
        clan_id: clanId,
      } as Partial<SoulHomeDto>)
      .mockResolvedValueOnce(null);

    await expect(
      roomRules(
        user,
        UpdateRoomDto,
        Action.update,
        { _id: roomId } as any,
        requestHelperService,
      ),
    ).rejects.toThrow(ForbiddenException);
  });

  it("Should throw ForbiddenException if the room's SoulHome belongs to a different Clan than the logged-in player (cross-clan update)", async () => {
    getModelInstanceById
      .mockResolvedValueOnce({
        _id: roomId,
        soulHome_id: soulHomeId,
      } as Partial<RoomDto>)
      .mockResolvedValueOnce({
        _id: soulHomeId,
        clan_id: otherClanId,
      } as Partial<SoulHomeDto>)
      .mockResolvedValueOnce({ clan_id: clanId } as Partial<Player>);

    await expect(
      roomRules(
        user,
        UpdateRoomDto,
        Action.update,
        { _id: roomId } as any,
        requestHelperService,
      ),
    ).rejects.toThrow(ForbiddenException);
  });

  it("Should throw ForbiddenException on delete if the room's SoulHome belongs to a different Clan than the logged-in player", async () => {
    getModelInstanceById
      .mockResolvedValueOnce({
        _id: roomId,
        soulHome_id: soulHomeId,
      } as Partial<RoomDto>)
      .mockResolvedValueOnce({
        _id: soulHomeId,
        clan_id: otherClanId,
      } as Partial<SoulHomeDto>)
      .mockResolvedValueOnce({ clan_id: clanId } as Partial<Player>);

    await expect(
      roomRules(
        user,
        RoomDto,
        Action.delete,
        { _id: roomId } as any,
        requestHelperService,
      ),
    ).rejects.toThrow(ForbiddenException);
  });

  it("Should allow update and delete if the room's SoulHome belongs to the logged-in player's Clan", async () => {
    getModelInstanceById
      .mockResolvedValueOnce({
        _id: roomId,
        soulHome_id: soulHomeId,
      } as Partial<RoomDto>)
      .mockResolvedValueOnce({
        _id: soulHomeId,
        clan_id: clanId,
      } as Partial<SoulHomeDto>)
      .mockResolvedValueOnce({ clan_id: clanId } as Partial<Player>);

    const ability = await roomRules(
      user,
      UpdateRoomDto,
      Action.update,
      { _id: roomId } as any,
      requestHelperService,
    );

    expect(ability.can(Action.update_request, UpdateRoomDto)).toBe(true);
    expect(ability.can(Action.delete_request, UpdateRoomDto)).toBe(true);
  });
});
