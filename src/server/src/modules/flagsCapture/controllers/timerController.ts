import { SHARED_CONSTANTS } from "@shared/constants"
import { FlagCaptureHandlers } from "../classes/handlers"
import { Tools } from "../../tools"

export class TimerController {
    private timer: number
    private phase: number
    private interval: NodeJS.Timeout | undefined

    constructor() {
        this.timer = SHARED_CONSTANTS.TIMER.lobbyStart
        this.phase = 0
        this.interval = setInterval(this.everyTick.bind(this), 1000)
    }

    public getTimer() {
        return this.timer
    }

    public getPhase() {
        return this.phase
    }

    private everyTick() {
        if(!FlagCaptureHandlers.lobby) {
            if(this.interval) {
                clearInterval(this.interval)
                this.interval = undefined
            }
            return
        }

        const lobby = FlagCaptureHandlers.lobby!

        if(!lobby.isLobbyStarted()) return

        this.timer--

        if(this.timer <= 0) {
            this.phase++
            if(this.phase > SHARED_CONSTANTS.TIMER_PHASES.length - 1) {
                if(this.interval) {
                    clearInterval(this.interval)
                    this.interval = undefined
                }

                lobby.endLobby()
                return
            }
            const nextPhaseName = SHARED_CONSTANTS.TIMER_PHASES[this.phase] as keyof typeof SHARED_CONSTANTS.TIMER
            const nextPhaseData = SHARED_CONSTANTS.TIMER[nextPhaseName]
            this.timer = typeof nextPhaseData === 'number' ? nextPhaseData : Tools.getRandomNumberByRange(nextPhaseData as [number, number])

            if(nextPhaseName == 'capture') {
                lobby.startCapture()
            }
        }
        lobby.teamsController.updateHud()
    }

    public destroy() {
        if(this.interval) {
            clearInterval(this.interval)
            this.interval = undefined
        }
    }
}