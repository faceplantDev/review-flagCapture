import { PlayerTools } from "../../player/playerTools";
import { Tools } from "../../tools";
import { FlagCaptureHandlers } from "../classes/handlers";
import { IFlagCaptureTeams } from "@shared/types";
import { FlagsController } from "./flagsController";
import { TeamController } from "./teamController";
import { SHARED_CONSTANTS } from "@shared/constants";
import { TimerController } from "./timerController";

export class LobbyController {
    private isStarted = false;
    public readonly teamsController: TeamController;
    public readonly flagsController: FlagsController;
    public readonly timerController: TimerController;
    public readonly map: typeof SHARED_CONSTANTS.MAPS[number]
    public readonly weapon: number

    constructor() {
        this.weapon = Tools.getRandomElementOfObject(SHARED_CONSTANTS.WEAPONS);
        this.map = Tools.getRandomElementOfArray(SHARED_CONSTANTS.MAPS);

        this.teamsController = new TeamController();
        this.timerController = new TimerController();
        this.flagsController = new FlagsController(this.map.flags.map(flag => Tools.xyzToMpVector3(flag)));
    }

    public startGame() {
        this.isStarted = true;

        const playersInRed = this.teamsController.getPlayersInTeam('red');
        const playersInBlue = this.teamsController.getPlayersInTeam('blue');


        // Автобаланс команд
        if (playersInRed.length !== playersInBlue.length) {
            const playersToMove = Math.abs(playersInRed.length - playersInBlue.length);

            const playersToMoveFrom = playersInRed.length > playersInBlue.length ? 'red' : 'blue';
            const playersToMoveTo = playersToMoveFrom === 'red' ? 'blue' : 'red';

            const playersToMoveList = playersInRed.length > playersInBlue.length
                ? playersInRed.slice(0, playersToMove)
                : playersInBlue.slice(0, playersToMove);

            playersToMoveList.forEach(p => {
                this.teamsController.removePlayerFromTeam(playersToMoveFrom, p);
                this.teamsController.addPlayerToTeam(playersToMoveTo, p);
            })
        }

        const players = this.teamsController.getPlayers();
        players.forEach(p => p.call('C:Player:Freeze', [true]))
        players.forEach(LobbyController.teleportToRandomSpawn)
    }

    public startCapture() {
        const players = this.teamsController.getPlayers();
        players.forEach(p => p.giveWeapon(this.weapon, 9999))
        players.forEach(p => p.call('C:Player:Freeze', [false]))
    }

    public teamWin(team: IFlagCaptureTeams) {
        this.teamsController.updateHud({
            message: `Команда ${team} победила!`,
            team: undefined
        })
        this.endLobby()
    }

    public endLobby() {
        const players = this.teamsController.getPlayers();
        players.forEach(p => p.call('C:Player:Freeze', [true]))
        players.forEach(p => PlayerTools.teleport(p, Tools.xyzToMpVector3(SHARED_CONSTANTS.LOBBY_POSITION)))
    }

    public isLobbyStarted() {
        return this.isStarted;
    }

    public static isLobbyCreated() {
        const lobby = FlagCaptureHandlers.lobby
        return lobby ? lobby : false;
    }

    public static teleportToRandomSpawn(player: PlayerMp) {
        const lobby = FlagCaptureHandlers.lobby
        if(!lobby) throw new Error('Lobby is not created');
        
        const playerTeam = lobby.teamsController.getPlayerTeam(player)
        if(!playerTeam) throw new Error('Player is not in a team');

        const position = Tools.xyzToMpVector3(Tools.getRandomElementOfArray(lobby.map.spawns[playerTeam]));
        PlayerTools.teleport(player, position);

        return true
    }

    public destroy() {
        this.flagsController.destroy();
        this.timerController.destroy();
    }
}