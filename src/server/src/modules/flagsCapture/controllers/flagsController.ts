import { SHARED_CONSTANTS } from "@shared/constants";
import { Tools } from "../../tools";
import { Flag } from "../classes/flag";
import { FlagCaptureHandlers } from "../classes/handlers";
import { IFlagCaptureTeams } from "@shared/types";
import { ColshapeMpExtended } from "@/@types";

export class FlagsController {
    private _flags: Flag[] = []
    constructor(flags: Vector3[]) {
        flags.forEach((flag, index) => {
            this._flags.push(new Flag(SHARED_CONSTANTS.FLAG_NAMES[index], flag, undefined));
        })

        mp.events.add('playerEnterColshape', this.playerEnterColshape.bind(this))
        mp.events.add('playerExitColshape', this.playerLeaveColshape.bind(this))
    }

    public teamTakesFlag(team: IFlagCaptureTeams, flag: Flag) {
        if(!FlagCaptureHandlers.lobby) throw new Error('Lobby is not created');
        
        if(this._flags.every(f => f.team == team)) {
            console.log(`Team ${team} already took all flags`);
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

    private playerEnterColshape(player: PlayerMp, shape: ColshapeMpExtended) {
        if(!FlagCaptureHandlers.lobby) return
        if(!FlagCaptureHandlers.lobby!.isLobbyStarted()) return
        if(FlagCaptureHandlers.lobby!.timerController.getPhase() == 0) return

        const flag = shape.flagInfo as Flag
        if(!flag) return
        if(!this._flags.includes(flag)) return

        flag.playerEnter(player)
        console.log(`Player ${player.name} entered colshape`)
    }

    private playerLeaveColshape(player: PlayerMp, shape: ColshapeMpExtended) {
        if(!FlagCaptureHandlers.lobby) return
        if(!FlagCaptureHandlers.lobby!.isLobbyStarted()) return
        if(FlagCaptureHandlers.lobby!.timerController.getPhase() == 0) return

        const flag = shape.flagInfo as Flag
        if(!flag) return
        if(!this._flags.includes(flag)) return
        
        flag.playerLeaveOrDead(player)
        console.log(`Player ${player.name} left colshape`)
    }

    public destroy() {
        mp.events.remove('playerEnterColshape', this.playerEnterColshape.bind(this))
        mp.events.remove('playerExitColshape', this.playerLeaveColshape.bind(this))

        this._flags.forEach(flag => flag.destroy())
    }
}