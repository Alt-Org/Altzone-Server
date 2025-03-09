import { ObjectId } from "mongodb";
import { BoxService } from "../../../box/box.service";
import BoxBuilderFactory from "../data/boxBuilderFactory";
import BoxModule from "../modules/box.module";
import ProfileModule from "../../profile/modules/profile.module";
import ProfileBuilderFactory from "../../profile/data/profileBuilderFactory";
import PlayerBuilderFactory from "../../player/data/playerBuilderFactory";
import PlayerModule from "../../player/modules/player.module";
import ClanBuilderFactory from "../../clan/data/clanBuilderFactory";
import ClanModule from "../../clan/modules/clan.module";
import ClanInventoryBuilderFactory from "../../clanInventory/data/clanInventoryBuilderFactory";
import SoulhomeModule from "../../clanInventory/modules/soulhome.module";
import RoomModule from "../../clanInventory/modules/room.module";
import StockModule from "../../clanInventory/modules/stock.module";
import ChatBuilderFactory from "../../chat/data/chatBuilderFactory";
import ChatModule from "../../chat/modules/chat.module";
import { Box } from "../../../box/schemas/box.schema";
import { SessionStage } from "../../../box/enum/SessionStage.enum";

describe("BoxService.resetTestingSessions() test suite", () => {
	let boxService: BoxService;
	let boxToDelete: Box;
	let boxToKeep: Box;

	const boxBuilder = BoxBuilderFactory.getBuilder("Box");
	const boxModel = BoxModule.getBoxModel();
	const adminModel = BoxModule.getGroupAdminModel();
	const profileModel = ProfileModule.getProfileModel();
	const playerModel = PlayerModule.getPlayerModel();
	const clanModel = ClanModule.getClanModel();
	const soulHomeModel = SoulhomeModule.getSoulhomeModel();
	const roomModel = RoomModule.getRoomModel();
	const stockModel = StockModule.getStockModel();
	const chatModel = ChatModule.getChatModel();

	const adminBuilder = BoxBuilderFactory.getBuilder("GroupAdmin");
	const testerBuilder = BoxBuilderFactory.getBuilder("Tester");
	const profileBuilder = ProfileBuilderFactory.getBuilder("Profile");
	const playerBuilder = PlayerBuilderFactory.getBuilder("Player");
	const clanBuilder = ClanBuilderFactory.getBuilder("Clan");
	const soulHomeBuilder = ClanInventoryBuilderFactory.getBuilder("SoulHome");
	const roomBuilder = ClanInventoryBuilderFactory.getBuilder("Room");
	const stockBuilder = ClanInventoryBuilderFactory.getBuilder("Stock");
	const chatBuilder = ChatBuilderFactory.getBuilder("Chat");

	beforeEach(async () => {
		boxService = await BoxModule.getBoxService();

		const existingAdmin = adminBuilder.setPassword("cronPassword").build();
		const adminResp = await adminModel.create(existingAdmin);
		existingAdmin._id = adminResp._id;

		const adminProfile = profileBuilder.setUsername("cronAdmin").build();
		const adminProfileResp = await profileModel.create(adminProfile);
		adminProfile._id = adminProfileResp._id;

		const adminPlayer = playerBuilder
			.setName("cronAdminPlayer")
			.setUniqueIdentifier("cronAdmin")
			.setProfileId(adminProfile._id)
			.build();
		const adminPlayerResp = await playerModel.create(adminPlayer);
		adminPlayer._id = adminPlayerResp._id;

		const existingClan1 = clanBuilder.setName("cronTestClanOne").build();
		const existingClanResp1 = await clanModel.create(existingClan1);
		existingClan1._id = existingClanResp1._id;
		const existingClan2 = clanBuilder.setName("cronTestClanTwo").build();
		const existingClanResp2 = await clanModel.create(existingClan2);
		existingClan2._id = existingClanResp2._id;

		const existingSoulHome1 = soulHomeBuilder.setName("cronTestSoulHome1").build();
		existingSoulHome1.clan_id = existingClan1._id;
		const existingSoulHomeResp1 = await soulHomeModel.create(existingSoulHome1);
		existingSoulHome1._id = existingSoulHomeResp1._id;
		const existingSoulHome2 = soulHomeBuilder.setName("cronTestSoulHome2").build();
		existingSoulHome2.clan_id = existingClan2._id;
		const existingSoulHomeResp2 = await soulHomeModel.create(existingSoulHome2);
		existingSoulHome2._id = existingSoulHomeResp2._id;

		const existingRoom1 = roomBuilder.build();
		existingRoom1.soulHome_id = existingSoulHome1._id;
		const existingRoomResp1 = await roomModel.create(existingRoom1);
		existingRoom1._id = existingRoomResp1._id;
		const existingRoom2 = roomBuilder.build();
		existingRoom2.soulHome_id = existingSoulHome2._id;
		const existingRoomResp2 = await roomModel.create(existingRoom2);
		existingRoom2._id = existingRoomResp2._id;

		const existingStock1 = stockBuilder.setClanId(existingClan1._id).build();
		const existingStockResp1 = await stockModel.create(existingStock1);
		existingStock1._id = existingStockResp1._id;
		const existingStock2 = stockBuilder.setClanId(existingClan2._id).build();
		const existingStockResp2 = await stockModel.create(existingStock2);
		existingStock2._id = existingStockResp2._id;

		const existingChat = chatBuilder.build();
		const existingChatResp = await chatModel.create(existingChat);
		existingChat._id = existingChatResp._id;

		const testerName1 = "cronTesterOne";
		const testerName2 = "cronTesterTwo";
		const testerProfile1 = profileBuilder.setUsername(testerName1).build();
		const testerProfileResp1 = await profileModel.create(testerProfile1);
		testerProfile1._id = testerProfileResp1._id;
		const testerProfile2 = profileBuilder.setUsername(testerName2).build();
		const testerProfileResp2 = await profileModel.create(testerProfile2);
		testerProfile2._id = testerProfileResp2._id;
		const testerPlayer1 = playerBuilder
			.setName(testerName1)
			.setUniqueIdentifier(testerName1)
			.setClanId(existingClan1._id)
			.setProfileId(testerProfile1._id)
			.build();
		const testerPlayerResp1 = await playerModel.create(testerPlayer1);
		testerPlayer1._id = testerPlayerResp1._id;
		const testerPlayer2 = playerBuilder
			.setName(testerName2)
			.setUniqueIdentifier(testerName2)
			.setClanId(existingClan1._id)
			.setProfileId(testerProfile2._id)
			.build();
		const testerPlayerResp2 = await playerModel.create(testerPlayer2);
		testerPlayer2._id = testerPlayerResp2._id;
		const tester1 = testerBuilder
			.setProfileId(new ObjectId(testerProfile1._id))
			.setPlayerId(new ObjectId(testerPlayer1._id))
			.build();
		const tester2 = testerBuilder
			.setProfileId(new ObjectId(testerProfile2._id))
			.setPlayerId(new ObjectId(testerPlayer2._id))
			.build();

		boxToDelete = boxBuilder
			.setSessionStage(SessionStage.END)
			.setAdminPassword(existingAdmin.password+"2")
			.setAdminPlayerId(new ObjectId(adminPlayer._id))
			.setAdminProfileId(new ObjectId(adminProfile._id))
			.setClanIds([
				new ObjectId(existingClan1._id),
				new ObjectId(existingClan2._id),
			])
			.setSoulHomeIds([
				new ObjectId(existingSoulHome1._id),
				new ObjectId(existingSoulHome2._id),
			])
			.setRoomIds([
				new ObjectId(existingRoom1._id),
				new ObjectId(existingRoom2._id),
			])
			.setStockIds([
				new ObjectId(existingStock1._id),
				new ObjectId(existingStock2._id),
			])
			.setChatId(new ObjectId(existingChat._id))
			.setTesters([tester1, tester2])
			.build();
		const boxToDeleteResp = await boxModel.create(boxToDelete);
		boxToDelete._id = boxToDeleteResp._id;

		boxToKeep = boxBuilder
			.setSessionStage(SessionStage.TESTING)
			.setAdminPassword(existingAdmin.password)
			.setAdminPlayerId(new ObjectId(adminPlayer._id))
			.setAdminProfileId(new ObjectId(adminProfile._id))
			.setClanIds([
				new ObjectId(existingClan1._id),
				new ObjectId(existingClan2._id),
			])
			.setSoulHomeIds([
				new ObjectId(existingSoulHome1._id),
				new ObjectId(existingSoulHome2._id),
			])
			.setRoomIds([
				new ObjectId(existingRoom1._id),
				new ObjectId(existingRoom2._id),
			])
			.setStockIds([
				new ObjectId(existingStock1._id),
				new ObjectId(existingStock2._id),
			])
			.setChatId(new ObjectId(existingChat._id))
			.setTesters([tester1, tester2])
			.build();
		const boxToKeepResp = await boxModel.create(boxToKeep);
		boxToKeep._id = boxToKeepResp._id;
	});

	it("Should delete boxes with sessionStage END and keep others", async () => {
		await boxService.resetTestingSessions();

		const boxToDeleteInDB = await boxModel.findById(boxToDelete._id);
		expect(boxToDeleteInDB).toBeNull();

		const boxToKeepInDB = await boxModel.findById(boxToKeep._id);
		expect(boxToKeepInDB).not.toBeNull();
	});
});
