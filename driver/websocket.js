const debug = require('debug')('sweet-sixteen:WebSocketDriver');
const http = require('http');
const express = require('express');
const expressLess = require('express-less');
const SocketIOServer = require('socket.io');
const ecstatic = require('ecstatic');

class WebsocketDriver {
	constructor(port = 8080) {
		this.port = port;
		this.shiftRegisterLength = 9 * 4;
		this.transmitted = WebsocketDriver.ensureArrayLength([], this.shiftRegisterLength);
		this.latched = this.transmitted;
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
		for(let register in data) {
			this.transmitted.unshift(data[register]);
		}

		this.transmitted = WebsocketDriver.ensureArrayLength(this.transmitted, this.shiftRegisterLength);
		return Promise.resolve()
	}

	latch() {
		debug('WebsocketDriver Latch');
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
		if(incoming.length > targetLength) {
			return incoming.slice(0, targetLength);
		}
		else if(incoming.length < targetLength) {
			const fill = new Array(targetLength - incoming.length);
			fill.fill(0);
			return incoming.concat(fill);
		}
		else {
			return incoming;
		}
	}
}

module.exports = WebsocketDriver;
