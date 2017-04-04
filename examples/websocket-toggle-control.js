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
		.addPlugin('toggle')))

	// setup and transmit
	.then(() => debug('Setting up Drivers'))
	.then(() => api.setup());
