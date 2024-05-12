import path from 'path';
import { config } from 'dotenv';

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