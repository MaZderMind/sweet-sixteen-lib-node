const debug = require('debug')('sweet-sixteen:RPiDriver');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require("fs"));
const SPI = require('pi-spi');

function retry(operation, delay) {
	return operation().catch(function(reason) {
		return Promise.delay(delay).then(retry.bind(null, operation, delay));
	});
}

class RPiDriver {
	constructor() {
		this.GPIO_LATCH = 22;
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
		return Promise.all([
			this.initializeSPI(),
			this.openLatchGpio(),
			this.openPWMGpio(),
		]).then(() => debug('setup done'));
	}

	transmit(data) {
		const buf = Buffer.alloc(this.api.shiftRegisterCount * 2);
		data.forEach((register, index) => {
			const offset = (this.api.shiftRegisterCount * 2) - (index * 2) - 2;
			buf.writeUInt16BE(register, offset);
		});

		debug('buf', buf);
		return this.spi.writeAsync(buf);
	}

	latch() {
		return fs.writeFileAsync('/sys/class/gpio/gpio'+this.GPIO_LATCH+'/value', '1')
			.then(() => fs.writeFileAsync('/sys/class/gpio/gpio'+this.GPIO_LATCH+'/value', '0'));
	}

	initializeSPI() {
		debug('SPI: initializing');
		this.spi = Promise.promisifyAll( SPI.initialize("/dev/spidev0.0") );
		debug('SPI: done');
		return Promise.resolve();
	}

	openLatchGpio() {
		debug('Latch: initializing');
		return fs.accessAsync('/sys/class/gpio/gpio'+this.GPIO_LATCH, fs.constants.W_OK)
			.then(() => debug('gpio already exported'))
			.catch(() => {
				debug('Latch: exporting gpio');
				return fs.writeFileAsync('/sys/class/gpio/export', '22');
			})
			.then(() => retry(() => {
				debug('Latch: waiting for expoer');
				return Promise.all([
					fs.accessAsync('/sys/class/gpio/gpio'+this.GPIO_LATCH+'/direction', fs.constants.W_OK),
					fs.accessAsync('/sys/class/gpio/gpio'+this.GPIO_LATCH+'/value', fs.constants.W_OK),
				]);
			}, 250))
			.then(() => {
				debug('Latch: setting direction');
				return fs.writeFileAsync('/sys/class/gpio/gpio'+this.GPIO_LATCH+'/direction', 'out');
			})
			.then(() => {
				debug('Latch: setting value');
				return fs.writeFileAsync('/sys/class/gpio/gpio'+this.GPIO_LATCH+'/value', '0');
			})
			.then(() => debug('Latch: done'));
	}

	openPWMGpio() {
		return Promise.resolve();
	}
}

module.exports = RPiDriver;
