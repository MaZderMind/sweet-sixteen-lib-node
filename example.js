const debug = require('debug')('sweet-sixteen:example');
const LowLevelApi = require("./lowlevel");
const RPiDriver = require("./driver/rpi");
const WebSocketDriver = require("./driver/websocket");

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

	.then(() => debug('Transmitting some Data'))
	.then(() => ll.transmit(0xABCD))
	.then(() => ll.latch())
	.then(() => debug('Done. Bye.'));

// The WebSocketDriver will keep the Program running
// Without it we would terminate now
