import { PlayerTools } from "./classes/tools";

export class PlayerEvents {
    private events: Record<string, (...args: any[]) => void> = {
        "C:Player:Ragdoll": PlayerTools.ragDoll,
        "C:Player:Freeze": PlayerTools.setFreeze,
        "C:Player:Blackscreen": PlayerTools.setBlackScreen,
        "incomingDamage": PlayerTools.incomingDamage
    }

    constructor() {
        this.init();
    }

    private init() {
        for (const event in this.events) {
            const handler = this.events[event as keyof IClientEvents];
            if (handler) {
                mp.events.add(event as keyof IClientEvents, handler);
            }
        }
    }

    public destroy() {
        for (const event in this.events) {
            mp.events.remove(event);
        };
    }
}