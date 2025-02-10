import { Module } from "@nestjs/common";
import { PlayerModule } from "../player/player.module";
import { ClanModule } from "../clan/clan.module";
import { PlayerRewarder } from "./playerRewarder/playerRewarder.service";
import { ClanRewarder } from "./clanRewarder/clanRewarder.service";


@Module({
	imports: [
		PlayerModule,
		ClanModule
	],
	providers: [
		PlayerRewarder,
		ClanRewarder
	],
	exports: [
		PlayerRewarder,
		ClanRewarder
	]
})
export class RewarderModule {}
