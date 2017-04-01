const debug = require('debug')('sweet-sixteen:WebSocketDriver');
const http = require('http');
const express = require('express');
const expressLess = require('express-less');
const SocketIOServer = require('socket.io');
const ecstatic = require('ecstatic');

class WebsocketDriver {
	constructor(port = 8080) {
		this.port = port;
		this.transmitted = null;
		this.latched = null;
	}

	static canRun() {
		debug("WebsocketDriver can always run");
		return Promise.resolve()
	}

	setup() {
		const app = express();

		app.use(expressLess(
			__dirname + '/../web-ui/'
		));

		app.use(ecstatic({
			root: __dirname + '/../web-ui/'
		}));

		const libs = {
			'jquery': 'jquery/dist',
			'jquery-svg-to-inline': 'jquery-svg-to-inline/dist',
		};

		for(let lib in libs) {
			const path = libs[lib];
			app.use(ecstatic({
				baseDir: '/'+lib,
				root:    __dirname + '/../node_modules/'+path
			}));
		}

		const server = http
			.createServer(app)
			.listen(this.port);

		const io = new SocketIOServer(server);
		io.on('connection', (socket) => {
			debug('New Connection, sending current latched State as Update');
			socket.emit('update', {state: this.latched});
		});

		this.io = io;

		debug("WebsocketDriver setup completed, now listening on", this.port);
		return Promise.resolve()
	}

	transmit(data) {
		debug('WebsocketDriver Transmit');
		this.transmitted = data;
		return Promise.resolve()
	}

	latch() {
		debug('WebsocketDriver Latch');
		this.latched = this.transmitted;
		this.io.sockets.emit('update', {state: this.latched});
		return Promise.resolve()
	}
}

module.exports = WebsocketDriver;
