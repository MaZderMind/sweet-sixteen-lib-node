const debug = require('debug')('sweet-sixteen:WebSocketDriver');
const http = require('http');
const express = require('express');
const ecstatic = require('ecstatic');

class WebsocketDriver {
	constructor(port = 8080) {
		this.port = port;
	}

	static canRun() {
		debug("WebsocketDriver can always run");
		return Promise.resolve()
	}

	setup() {
		const app = express();

		app.use(ecstatic({
			root: __dirname + '/../web-ui/'
		}));

		http
			.createServer(app)
			.listen(this.port);

		this.app = app;
		debug("WebsocketDriver setup completed, now listening on", this.port);
		return Promise.resolve()
	}

	transmit(data) {
		debug('WS Transmit');
		return Promise.resolve("WS Transmit failed")
	}

	latch() {
		debug('WS Latch');
		return Promise.resolve("WS Latch failed")
	}
}

module.exports = WebsocketDriver;
