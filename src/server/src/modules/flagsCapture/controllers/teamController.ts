import { SHARED_CONSTANTS } from "@shared/constants";
import { FlagCaptureHandlers } from "../classes/handlers";
import { IFlagCaptureTeams } from "@shared/types";
import { LobbyController } from "./lobbyController";

export class TeamController {
    private teams: Record<IFlagCaptureTeams, PlayerMp[]> = {
        'red': [],
        'blue': []
    }
    constructor() {
        mp.events.add("S:Zones:PlayerLog", this.playerExitZone.bind(this));
    }

    private playerExitZone(player: PlayerMp, exitOrEnter: boolean) {
        if(exitOrEnter) return

        player.call('C:Player:Ragdoll');

        setTimeout(() => {
            LobbyController.teleportToRandomSpawn(player);
        }, 2000)
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
    }

    public setPlayerGodMode(player: PlayerMp) {
        player.setVariable('godmode', true);
        player.alpha = 200;
        setTimeout(() => {
            player.setVariable('godmode', false);
            player.alpha = 255;
        }, SHARED_CONSTANTS.GODMODE_TIMEOUT);
    }

    public removePlayerFromTeam(team: IFlagCaptureTeams, player: PlayerMp) {
        if (!this.teams[team].includes(player)) return;
        this.teams[team].splice(this.teams[team].indexOf(player), 1);

        this.updateHud();
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
    }

    public updateHud(message?: {message: string, team: IFlagCaptureTeams | undefined}) {
        if(!FlagCaptureHandlers.lobby) throw new Error('Lobby is not created');
        const blueTeamSize = this.teams['blue'].length;
        const redTeamSize = this.teams['red'].length;

        const timer = FlagCaptureHandlers.lobby!.timerController

        const data = {
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
                message: message != undefined ? message.team == this.getPlayerTeam(p) ? message.message : message.team == undefined ? message.message : undefined : undefined,
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

    public static getColor(team: IFlagCaptureTeams | undefined) {   
        return SHARED_CONSTANTS.TEAMS_COLORS[team == undefined ? 'free' : team];
    }

    public static getColorInt(team: IFlagCaptureTeams | undefined) {   
        return SHARED_CONSTANTS.TEAMS_INT_COLORS[team == undefined ? 'free' : team];
    }

    public static getEnemyTeam(team: IFlagCaptureTeams) {
        return team == 'red' ? 'blue' : 'red';
    }
}