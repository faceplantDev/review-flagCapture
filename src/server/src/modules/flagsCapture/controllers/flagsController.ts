import { SHARED_CONSTANTS } from "@shared/constants";
import { Tools } from "../../tools";
import { Flag } from "../classes/flag";
import { FlagCaptureHandlers } from "../classes/handlers";
import { IFlagCaptureTeams } from "@shared/types";

export class FlagsController {
    private _flags: Flag[] = []
    constructor(flags: Vector3[]) {
        flags.forEach((flag, index) => {
            this._flags.push(new Flag(SHARED_CONSTANTS.FLAG_NAMES[index], flag, undefined));
        })

        mp.events.add('playerEnterColshape', this.playerEnterColshape.bind(this))
        mp.events.add('playerExitColshape', this.playerLeaveColshape.bind(this))
        mp.events.add('playerDeath', this.playerDeath.bind(this))
    }

    public teamTakesFlag(team: IFlagCaptureTeams, flag: Flag) {
        if(!FlagCaptureHandlers.lobby) throw new Error('Lobby is not created');
        
        if(this._flags.every(f => f.team == team)) {
            FlagCaptureHandlers.lobby!.teamWin(team)
        }
    }

    public getTeamFlags(team: IFlagCaptureTeams) {
        return this._flags.filter(f => f.team == team)
    }

    public isPlayerOnFlag(player: PlayerMp): false | Flag {
        if(!FlagCaptureHandlers.lobby) throw new Error('Lobby is not created');

        let isPlayerOnFlag: false | Flag = false

        this._flags.forEach((flag) => {
            if (Tools.getDistanceTo2D(player.position, flag.getPosition()) < SHARED_CONSTANTS.MARKER_PARAMS.scale) {
                isPlayerOnFlag = flag
            }
        })

        return isPlayerOnFlag
    }

    private playerEnterColshape(player: PlayerMp, shape: ColshapeMp) {
        if(!FlagCaptureHandlers.lobby) return
        if(!FlagCaptureHandlers.lobby!.isLobbyStarted()) return
        if(FlagCaptureHandlers.lobby!.timerController.getPhase() == 0) return

        const flag = shape.data as Flag
        if(!flag) return

        flag.playerEnter(player)
    }

    private playerLeaveColshape(player: PlayerMp, shape: ColshapeMp) {
        if(!FlagCaptureHandlers.lobby) return
        if(!FlagCaptureHandlers.lobby!.isLobbyStarted()) return
        if(FlagCaptureHandlers.lobby!.timerController.getPhase() == 0) return

        const flag = shape.data as Flag
        if(!flag) return

        flag.playerLeaveOrDead(player)
    }

    private playerDeath(player: PlayerMp) {
        if(!FlagCaptureHandlers.lobby) return
        if(!FlagCaptureHandlers.lobby!.isLobbyStarted()) return
        if(FlagCaptureHandlers.lobby!.timerController.getPhase() == 0) return

        const flag = this.isPlayerOnFlag(player)
        if(!flag) return

        const playerTeam = FlagCaptureHandlers.lobby.teamsController.getPlayerTeam(player)
        if(!playerTeam) return

        flag.playerLeaveOrDead(player)
        player.spawn(Tools.xyzToMpVector3(Tools.getRandomElementOfArray(FlagCaptureHandlers.lobby!.map.spawns[playerTeam])))
        player.giveWeapon(FlagCaptureHandlers.lobby!.weapon, 9999)
    }

    public destroy() {
        mp.events.remove('playerEnterColshape', this.playerEnterColshape.bind(this))
        mp.events.remove('playerExitColshape', this.playerLeaveColshape.bind(this))
        mp.events.remove('playerDeath', this.playerDeath.bind(this))
    }
}