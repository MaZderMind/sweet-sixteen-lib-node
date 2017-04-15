const debug = require('debug')('sweet-sixteen:TogglePlugin');

class TogglePlugin {
	setDriver(driver) {
		debug('registered');
		this.driver = driver;
	}

	beforeSetup() {
		debug('adding client-plugin');
		this.driver.addClientPlugin('toggle');
	}

	onConnection(connection) {
		// FIXME remove duplication in webui-code
		const segmentOrder = [
			'g','t','s','u',
			'h','k','m','a',
			'b','n','c','p',
			'r','d','f','e',
		];

		const registerOrder = [
			0,1,2,3,
			7,6,5,4,
			8
		];

		const dpOrder = [
			4, 5, 6, 0, 1, 2, 3, 7,
			15, 14, 13, 12, 11, 10, 9, 8,
		];

		debug('binding event handler');
		connection.on('toggle', (boardId, displayId, segmentId) => {
			const api = this.driver.api;
			const lastData = api.lastTransmittedData;
			let bitIndex;
			if (segmentId === 'dp') {
				bitIndex = dpOrder.indexOf(displayId);
				displayId = 8;
			}
			else {
				bitIndex = segmentOrder.indexOf(segmentId);
			}

			const displayIndex = registerOrder.indexOf(displayId);
			const registerIndex = (boardId * 9) + displayIndex;
			lastData[registerIndex] = (lastData[registerIndex]) ^ (1<<bitIndex);
			api
				.transmit(lastData)
				.then(() => api.latch());
		});
	}
}

module.exports = TogglePlugin;
