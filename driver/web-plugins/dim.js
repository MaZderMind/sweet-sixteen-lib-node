const debug = require('debug')('sweet-sixteen:DimPlugin');

class DimPlugin {
	setDriver(driver) {
		debug('registered');
		this.driver = driver;
	}

	beforeSetup() {
		debug('adding client-plugin');
		this.driver.addClientPlugin('dim');
	}

	onConnection(connection) {
		debug('binding event handler');
		connection.on('dim', (value) => {
			const api = this.driver.api;
			api.dim(value);
		});
	}
}

module.exports = DimPlugin;
