const debug = require('debug')('sweet-sixteen:Api');
const Promise = require('bluebird');
let ecstatic = require('ecstatic');

class Api {
	constructor(shiftRegisterCount) {
		this.drivers = [];
		this.shiftRegisterCount = shiftRegisterCount;
		this.lastTransmittedData = Api.ensureArrayLength([], this.shiftRegisterCount);
	}

	addDriver(driver) {
		this.drivers.push(driver);
	}

	setup() {
		return Promise.all(
			this.drivers.map((driver) => driver.setApi(this).setup())
		);
	}

	transmit(data) {
		data = Api.ensureArrayLength(data, this.shiftRegisterCount);
		this.lastTransmittedData = data;
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

module.exports = Api;
