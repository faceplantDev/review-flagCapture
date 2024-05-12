import { FlagCaptureHandlers } from "./handlers";

export class FlagCaptureEvents {
    private events: Partial<Record<keyof IServerEvents, ThisifyServerEvents[keyof IServerEvents]>> = {
        "playerReady": FlagCaptureHandlers.playerReady
    }

    constructor() {
        this.init();
    }

    private init() {
        for (const event in this.events) {
            const handler = this.events[event as keyof IServerEvents];
            if (handler) {
                mp.events.add(event as keyof IServerEvents, handler);
            }
        }
    }

    public destroy() {
        for (const event in this.events) {
            mp.events.remove(event);
        };
    }
}