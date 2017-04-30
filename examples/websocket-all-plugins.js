const debug = require('debug')('sweet-sixteen:example');
const Api = require("../api");
const RPiDriver = require("../driver/rpi");
const WebDriver = require("../driver/web");
const TogglePlugin = require("../driver/web-plugins/toggle");
const DimPlugin = require("../driver/web-plugins/dim");
const AnimatePlugin = require("../driver/web-plugins/animate");
const readline = require('readline');

const boardCount = 2;
api = new Api(boardCount);
RPiDriver.canRun()
	// try to enable the RPiDriver
	.then(() => api.addDriver(new RPiDriver()))
	.catch((err) => debug("RPi Driver can't be initialized:", err))

	// always enable the WebDriver
	.then(() => api.addDriver(new WebDriver()
			.addPlugin(new TogglePlugin())
			.addPlugin(new DimPlugin())
			.addPlugin(new AnimatePlugin())
		))

	// setup and transmit
	.then(() => debug('Setting up Drivers'))
	.then(() => api.setup())
	.then(() => api.dim(1.00))
	.then(() => api.test())
	.then(() => api.clear());
