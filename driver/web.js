const debug = require('debug')('sweet-sixteen:WebSocketDriver');
const http = require('http');
const express = require('express');
const expressLess = require('express-less');
const SocketIOServer = require('socket.io');
const ecstatic = require('ecstatic');

class WebDriver {
	constructor(port = 8080) {
		this.port = port;
		this.shiftRegisterLength = 9 * 4;
		this.transmitted = WebDriver.ensureArrayLength([], this.shiftRegisterLength);
		this.latched = this.transmitted;
		this.interaction = false;
		this.plugins = [];
		this.clientPlugins = [];
		this.libs = {
			'jquery':               __dirname + '/../node_modules/jquery/dist',
			'jquery-svg-to-inline': __dirname + '/../node_modules/jquery-svg-to-inline/dist',
		};
	}

	static canRun() {
		debug("WebDriver can always run");
		return Promise.resolve()
	}

	setup() {
		const app = express();
		this.app = app;

		this.plugins.forEach(plugin => {
			if(plugin.beforeSetup) plugin.beforeSetup()
		});

		app.use(expressLess(
			__dirname + '/../web-ui/'
		));

		app.use(ecstatic({
			root: __dirname + '/../web-ui/'
		}));

		for (let lib in this.libs) {
			const path = this.libs[lib];
			app.use(ecstatic({
				baseDir: '/' + lib,
				root: path
			}));
		}

		const server = http
			.createServer(app)
			.listen(this.port);

		const io = new SocketIOServer(server);
		io.on('connection', (socket) => {
			debug('New Connection, sending current latched State as Update');
			socket.emit('setup', {
				clientPlugins: this.clientPlugins
			});
			socket.emit('update', {state: this.latched});

			this.plugins.forEach(plugin => {
				if(plugin.onConnection) plugin.onConnection(socket);
			});

		});

		this.io = io;

		this.plugins.forEach(plugin => {
			if(plugin.setup) plugin.setup();
		});

		debug("WebDriver setup completed, now listening on", this.port);
		return Promise.resolve()
	}

	isSetupDone() {
		return !!this.io;
	}

	addPlugin(plugin) {
		if (this.isSetupDone()) {
			console.error("Can't addPlugin after setup()!");
			return;
		}

		this.plugins.push(plugin);
		if(plugin.setDriver) plugin.setDriver(this);
		return this;
	}

	addLibraryPath(basepath, path) {
		this.libs[basepath] = path;
		return this;
	}

	addClientPlugin(name) {
		this.clientPlugins.push(name);
		return this;
	}

	transmit(data) {
		debug('WebDriver Transmit');
		for (let register in data) {
			this.transmitted.unshift(data[register]);
		}

		this.transmitted = WebDriver.ensureArrayLength(this.transmitted, this.shiftRegisterLength);
		return Promise.resolve()
	}

	latch() {
		debug('WebDriver Latch');
		this.latched = this.transmitted;
		this.io.sockets.emit('update', {state: this.latched});
		return Promise.resolve()
	}

	/**
	 *  > ensureArrayLength([7,8,9], 5)
	 *  [ 7, 8, 9, 0, 0 ]
	 *  > ensureArrayLength([6,7,8,9], 5)
	 *  [ 6, 7, 8, 9, 0 ]
	 *  > ensureArrayLength([5,6,7,8,9], 5)
	 *  [ 5, 6, 7, 8, 9 ]
	 *  > ensureArrayLength([4,5,6,7,8,9], 5)
	 *  [ 4, 5, 6, 7, 8 ]
	 *  > ensureArrayLength([3,4,5,6,7,8,9], 5)
	 *  [ 3, 4, 5, 6, 7 ]
	 *
	 * @param incoming
	 * @param targetLength
	 * @returns {*}
	 */
	static ensureArrayLength(incoming, targetLength) {
		if (incoming.length > targetLength) {
			return incoming.slice(0, targetLength);
		}
		else if (incoming.length < targetLength) {
			const fill = new Array(targetLength - incoming.length);
			fill.fill(0);
			return incoming.concat(fill);
		}
		else {
			return incoming;
		}
	}
}

module.exports = WebDriver;
