const debug = require('debug')('sweet-sixteen:WebSocketDriver');
const http = require('http');
const express = require('express');
const expressLess = require('express-less');
const SocketIOServer = require('socket.io');
const ecstatic = require('ecstatic');

class WebDriver {
	constructor(port = 8080) {
		this.port = port;
		this.transmitted = [];
		this.latched = this.transmitted;
		this.interaction = false;
		this.plugins = [];
		this.clientPlugins = [];
		this.api = null;
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
				boardCount: this.api.boardCount,
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

	setApi(api) {
		this.api = api;
		this.transmitted = this.api.lastTransmittedData;
		this.latched = this.transmitted;
		return this;
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
		this.transmitted = data;
		return Promise.resolve()
	}

	latch() {
		debug('WebDriver Latch');
		this.latched = this.transmitted;
		this.io.sockets.emit('update', {state: this.latched});
		return Promise.resolve()
	}

	dim(value) {
		return Promise.resolve();
	}
}

module.exports = WebDriver;
