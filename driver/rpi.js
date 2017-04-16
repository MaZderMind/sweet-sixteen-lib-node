const debug = require('debug')('sweet-sixteen:RPiDriver');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require("fs"));
let rpio = null;

function retry(operation, delay) {
	return operation().catch(function(reason) {
		return Promise.delay(delay).then(retry.bind(null, operation, delay));
	});
}

class RPiDriver {
	constructor() {
		this.P_OE = 12;
		this.P_LE = 15;
		this.spi = null;
	}

	static canRun() {
		return fs.readFileAsync('/proc/cpuinfo', {encoding: 'ascii'})
			.then((content) => {
				const isBCM2708 = content.indexOf('BCM2708') !== -1;
				const isBCM2709 = content.indexOf('BCM2709') !== -1;
				const isPi = isBCM2708 || isBCM2709;

				return isPi ? Promise.resolve() : Promise.reject('not on an RPi');
			});
	}

	setApi(api) {
		this.api = api;
		return this;
	}

	setup() {
		rpio = require('rpio');
		rpio.init({mapping: 'physical', gpiomem: false});
		this.initializeSPI();
		this.initializeLatchGpio();
		this.initializeDimGpio();
	}

	transmit(data) {
		const buf = Buffer.alloc(this.api.shiftRegisterCount * 2);
		data.forEach((register, index) => {
			const offset = (this.api.shiftRegisterCount * 2) - (index * 2) - 2;
			buf.writeUInt16BE(register, offset);
		});

		debug('buf', buf);
		rpio.spiWrite(buf, buf.length);
		return Promise.resolve();
	}

	dim(value) {
		rpio.pwmSetData(this.P_OE, (1-value)*1024);
	}

	latch() {
		rpio.write(this.P_LE, rpio.HIGH);
		rpio.write(this.P_LE, rpio.LOW);
	}

	initializeSPI() {
		rpio.spiBegin();
		rpio.spiSetClockDivider(64); // 4 MHz
		rpio.spiSetDataMode(0);
	}

	initializeLatchGpio() {
		rpio.open(this.P_LE, rpio.OUTPUT, rpio.LOW);
	}

	initializeDimGpio() {
		rpio.open(this.P_OE, rpio.PWM, rpio.LOW);
		rpio.pwmSetRange(this.P_OE, 1024);
		rpio.pwmSetData(this.P_OE, 0);
	}
}

module.exports = RPiDriver;
