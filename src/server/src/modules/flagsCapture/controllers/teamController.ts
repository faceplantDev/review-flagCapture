import { SHARED_CONSTANTS } from "@shared/constants";
import { FlagCaptureHandlers } from "../classes/handlers";
import { IFlagCaptureTeams } from "@shared/types";
import { LobbyController } from "./lobbyController";
import { Tools } from "../../tools";

export class TeamController {
    private teams: Record<IFlagCaptureTeams, PlayerMp[]> = {
        'red': [],
        'blue': []
    }
    constructor() {
        mp.events.add('playerLeavePolygon', this.playerExitZone.bind(this));
        mp.events.add("playerDeath", this.playerDeath.bind(this));
       
    }

    private playerExitZone(player: PlayerMp) {
        if(!FlagCaptureHandlers.lobby) return
        if(FlagCaptureHandlers.lobby.teamsController.getPlayerTeam(player) == undefined) return

        player.call('C:Player:Ragdoll');

        setTimeout(() => {
            LobbyController.teleportToRandomSpawn(player);
        }, 2000)

        console.log(`Player ${player.name} exitZone`)
    }

    public isReadyToStart() {
        const playerToStart = SHARED_CONSTANTS.PLAYERS_TO_START_PER_TEAM
        return FlagCaptureHandlers.lobby && !FlagCaptureHandlers.lobby.isLobbyStarted() && this.teams['blue'].length >= playerToStart && this.teams['red'].length >= playerToStart;
    }

    public getPlayers() {
        return this.teams['red'].concat(this.teams['blue']);
    }

    public addPlayerToTeam(team: IFlagCaptureTeams, player: PlayerMp) {
        this.teams[team].push(player);

        if(this.isReadyToStart()) {
            FlagCaptureHandlers.lobby?.startGame();
        }

        this.updateHud();

        console.log(`Player ${player.name} joined team ${team}`);
    }

    public setPlayerGodMode(player: PlayerMp) {
        player.setVariable('godmode', true);
        player.alpha = 200;
        setTimeout(() => {
            player.setVariable('godmode', false);
            player.alpha = 255;
        }, SHARED_CONSTANTS.GODMODE_TIMEOUT);

        console.log(`Player ${player.name} set godmode`);
    }

    public removePlayerFromTeam(team: IFlagCaptureTeams, player: PlayerMp) {
        if (!this.teams[team].includes(player)) return;
        this.teams[team].splice(this.teams[team].indexOf(player), 1);

        this.updateHud();

        console.log(`Player ${player.name} left team ${team}`);
    }

    public getPlayersInTeam(team: IFlagCaptureTeams) {
        return this.teams[team];
    }

    public getPlayerTeam(player: PlayerMp) {
        for (const team in this.teams) {
            if (this.teams[team as IFlagCaptureTeams].includes(player)) {
                return team as IFlagCaptureTeams;
            }
        }

        return undefined;
    }

    public removePlayer(player: PlayerMp) {
        for (const team in this.teams) {
            this.removePlayerFromTeam(team as IFlagCaptureTeams, player);
        }

        this.updateHud();

        console.log(`Player ${player.name} removed from team`);
    }

    public updateHud(message?: {message: string, team: IFlagCaptureTeams | undefined | 'all'}) {
        if(!FlagCaptureHandlers.lobby) throw new Error('Lobby is not created');
        const blueTeamSize = this.teams['blue'].length;
        const redTeamSize = this.teams['red'].length;

        const timer = FlagCaptureHandlers.lobby!.timerController

        const data = {
            mapName: FlagCaptureHandlers.lobby!.map.name,
            timer: timer.getTimer(),
            phase: timer.getPhase(),
            flags: {
                blue: FlagCaptureHandlers.lobby!.flagsController.getTeamFlags('blue').length,
                red: FlagCaptureHandlers.lobby!.flagsController.getTeamFlags('red').length
            },
            teamSizes: {
                blue: blueTeamSize,
                red: redTeamSize
            },
        }
        
        this.getPlayers().forEach((p) => {
            if(!FlagCaptureHandlers.lobby) return
            if(!mp.players.exists(p)) return
            const dataWithMessage = {
                ...data,
                message: message != undefined ? message.team == this.getPlayerTeam(p) ? message.message : message.team == 'all' ? message.message : undefined : undefined,
            }
            const flag = FlagCaptureHandlers.lobby!.flagsController.isPlayerOnFlag(p)
            if(flag) {
                const dataWithFlag = {
                    ...dataWithMessage,
                    activeFlag: flag.getProgress(p)
                }

                p.call('C:Flags:UpdateHud', [JSON.stringify(dataWithFlag)])
            } else p.call('C:Flags:UpdateHud', [JSON.stringify(dataWithMessage )])
        })


    }

    public async playerDeath(player: PlayerMp) {
        if(!FlagCaptureHandlers.lobby) return
        if(!FlagCaptureHandlers.lobby!.isLobbyStarted()) return
        if(FlagCaptureHandlers.lobby!.timerController.getPhase() == 0) return

        const playerTeam = FlagCaptureHandlers.lobby.teamsController.getPlayerTeam(player)
        if(!playerTeam) return
        
        const flag = FlagCaptureHandlers.lobby!.flagsController.isPlayerOnFlag(player)
        if(flag) {
            flag.playerLeaveOrDead(player)
        }

        player.call('C:Player:Blackscreen', [true])
        await Tools.sleep(500)
        player.spawn(Tools.xyzToMpVector3(Tools.getRandomElementOfArray(FlagCaptureHandlers.lobby!.map.spawns[playerTeam])))
        player.giveWeapon(FlagCaptureHandlers.lobby!.weapon, 9999)
        FlagCaptureHandlers.lobby!.teamsController.setPlayerGodMode(player)
        player.call('C:Player:Blackscreen', [false])

        console.log(`Player ${player.name} died in zone`)
    }

    public static getColor(team: IFlagCaptureTeams | undefined) {   
        return SHARED_CONSTANTS.TEAMS_COLORS[team == undefined ? 'free' : team];
    }

    public static getColorInt(team: IFlagCaptureTeams | undefined) {   
        return SHARED_CONSTANTS.TEAMS_INT_COLORS[team == undefined ? 'free' : team];
    }

    public static getEnemyTeam(team: IFlagCaptureTeams) {
        return team == 'red' ? 'blue' : 'red';
    }

    public destroy() {
        mp.events.remove('playerLeavePolygon', this.playerExitZone.bind(this));
        mp.events.remove("playerDeath", this.playerDeath.bind(this));
    }
}