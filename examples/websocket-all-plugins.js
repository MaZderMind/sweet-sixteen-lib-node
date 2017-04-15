const debug = require('debug')('sweet-sixteen:example');
const Api = require("../api");
const RPiDriver = require("../driver/rpi");
const WebDriver = require("../driver/web");
const TogglePlugin = require("../driver/web-plugins/toggle");
const readline = require('readline');

api = new Api();
RPiDriver.canRun()
	// try to enable the RPiDriver
	.then(() => api.addDriver(new RPiDriver()))
	.catch((err) => debug("RPi Driver can't be initialized:", err))

	// always enable the WebDriver
	.then(() => api.addDriver(new WebDriver()
			.addPlugin(new TogglePlugin())
		))

	// setup and transmit
	.then(() => debug('Setting up Drivers'))
	.then(() => api.setup());
