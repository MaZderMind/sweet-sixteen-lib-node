const debug = require('debug')('sweet-sixteen:example');
const LowLevelApi = require("../lowlevel");
const RPiDriver = require("../driver/rpi");
const WebSocketDriver = require("../driver/websocket");
const readline = require('readline');

ll = new LowLevelApi();
RPiDriver.canRun()
	// try to enable the RPiDriver
	.then(() => ll.addDriver(new RPiDriver()))
	.catch((err) => debug("RPi Driver can't be initialized:", err))

	// always enable the WebSocketDriver
	.then(() => ll.addDriver(new WebSocketDriver()
		.enableInteraction()))

	// setup and transmit
	.then(() => debug('Setting up Drivers'))
	.then(() => ll.setup())

	.then(() => console.log('Type 16-Bit Packet in Hex, separated by Space per Line to transmit & latch'))
	.then(() => console.log(' ie. "FA32 FFE5 65B3 D55F"'));

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});
rl.on('line', (input) => {
	let numbers = input.split(' ').map(str => parseInt(str.trim(), 16));
	ll.transmit(numbers);
	ll.latch();
});
