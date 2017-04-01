const debug = require('debug')('sweet-sixteen:example');
const LowLevelApi = require("./lowlevel");
const RPiDriver = require("./driver/rpi");
const WebSocketDriver = require("./driver/websocket");
const readline = require('readline');

ll = new LowLevelApi();
RPiDriver.canRun()
	// try to enable the RPiDriver
	.then(() => ll.addDriver(new RPiDriver()))
	.catch((err) => debug("RPi Driver can't be initialized:", err))

	// always enable the WebSocketDriver
	.then(() => ll.addDriver(new WebSocketDriver()))

	// setup and transmit
	.then(() => debug('Setting up Drivers'))
	.then(() => ll.setup())

	.then(() => console.log('Type one Packet per Line to transmit, type an empty line to latch'));

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});
rl.on('line', (input) => {
	if(input == '') {
		ll.latch();
	}
	else {
		n = parseInt(input, 16);
		ll.transmit([n]);
	}
});
