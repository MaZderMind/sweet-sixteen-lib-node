const debug = require('debug')('sweet-sixteen:LowLevel');
const Promise = require('bluebird');
let ecstatic = require('ecstatic');

class LowLevel {
	constructor() {
		this.drivers = [];
	}

	addDriver(driver) {
		this.drivers.push(driver);
	}

	setup() {
		return Promise.all(
			this.drivers.map((driver) => driver.setup())
		);
	}

	transmit(data) {
		return Promise.all(
			this.drivers.map((driver) => driver.transmit(data))
		);
	}

	latch() {
		return Promise.all(
			this.drivers.map((driver) => driver.latch())
		);
	}

	dim(brightness) {
		return Promise.all(
			this.drivers.map((driver) => driver.dim(brightness))
		);
	}
}

module.exports = LowLevel;
