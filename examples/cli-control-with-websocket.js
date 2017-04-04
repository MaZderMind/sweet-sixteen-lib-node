const debug = require('debug')('sweet-sixteen:example');
const Api = require("../api");
const RPiDriver = require("../driver/rpi");
const WebSocketDriver = require("../driver/websocket");
const readline = require('readline');

api = new Api();
RPiDriver.canRun()
	// try to enable the RPiDriver
	.then(() => api.addDriver(new RPiDriver()))
	.catch((err) => debug("RPi Driver can't be initialized:", err))

	// always enable the WebSocketDriver
	.then(() => api.addDriver(new WebSocketDriver()
		.enableInteraction()))

	// setup and transmit
	.then(() => debug('Setting up Drivers'))
	.then(() => api.setup())

	.then(() => console.log('Type 16-Bit Packet in Hex, separated by Space per Line to transmit & latch'))
	.then(() => console.log(' ie. "FA32 FFE5 65B3 D55F"'));

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});
rl.on('line', (input) => {
	let numbers = input.split(' ').map(str => parseInt(str.trim(), 16));
	api.transmit(numbers);
	api.latch();
});
