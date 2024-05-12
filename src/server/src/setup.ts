import path from 'path';
import { config } from 'dotenv';
import { FlagCaptureHandlers } from './modules/flagsCapture/classes/handlers';
import { LobbyController } from './modules/flagsCapture/controllers/lobbyController';

config({
	path: path.resolve('.env')
});

process.on('uncaughtException', (error) => {
	console.log('-----------uncaughtException-----------');
	console.log(error.stack);
	console.log('----------------------------------------')
})

process.on('unhandledRejection', (error) => {
	console.log('-----------unhandledRejection-----------');
	console.log(error);
	console.log('----------------------------------------')
})

//Boot

FlagCaptureHandlers.lobby = new LobbyController()