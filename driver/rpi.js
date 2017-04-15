const debug = require('debug')('sweet-sixteen:RPiDriver');
const Promise = require('bluebird');
const Buffer = require('buffer');
const fs = Promise.promisifyAll(require("fs"));
const SPI = Promise.promisifyAll(require('pi-spi'));

class RPiDriver {
	constructor() {
		this.GPIO_LATCH = 22;
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
		return Promise.all([
			this.initializeSPI(),
			this.openLatchGpio(),
			this.openPWMGpio(),
		]);
	}

	transmit(data) {
		const buf = new Buffer.alloc(this.api.shiftRegisterCount * 2);
		data.forEach(register => buf.readUInt16BE(register));
		return SPI.transmitAsync(buf, buf.length);
	}

	latch() {
		return fs.writeFileAsync('/sys/class/gpio/gpio'+this.GPIO_LATCH+'/value', '1')
			.then(() => fs.writeFileAsync('/sys/class/gpio/gpio'+this.GPIO_LATCH+'/value', '0'));
	}

	initializeSPI() {
		debug('SPI: initializing');
		SPI.initialize("/dev/spidev0.0");
		debug('SPI: done');
		return Promise.resolve();
	}

	openLatchGpio() {
		return fs.writeFileAsync('/sys/class/gpio/export', this.GPIO_LATCH)
			.then(() => fs.writeFileAsync('/sys/class/gpio/gpio'+this.GPIO_LATCH+'/direction', 'out'))
			.then(() => fs.writeFileAsync('/sys/class/gpio/gpio'+this.GPIO_LATCH+'/value', '0'));
	}

	openPWMGpio() {
		return Promise.resolve();
	}
}

module.exports = RPiDriver;
