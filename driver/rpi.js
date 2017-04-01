const fs = require('fs');
const debug = require('debug')('sweet-sixteen:RPiDriver');
const Promise = require('bluebird');

class RPiDriver {
	static canRun() {
		debug("Disabling RPi Driver");
		return Promise.reject("not on an RPi")
	}

	setup() {
		debug('RPi Setup');
		return Promise.reject("RPi Setup failed")
	}

	transmit(data) {
		debug('RPi Transmit');
		return Promise.reject("RPi Transmit failed")
	}

	latch() {
		debug('RPi Latch');
		return Promise.reject("RPi Latch failed")
	}
}

module.exports = RPiDriver;
