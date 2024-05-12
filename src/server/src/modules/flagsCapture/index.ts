import { FlagCaptureEvents } from './classes/events'
import { FlagCaptureHandlers } from './classes/handlers';

const flagCaptureEvents = new FlagCaptureEvents();

mp.events.addCommand('start', () => {
    FlagCaptureHandlers.lobby?.startGame();
})