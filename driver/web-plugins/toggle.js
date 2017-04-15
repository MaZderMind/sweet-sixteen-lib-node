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
		debug('binding event handler');
		connection.on('toggle', (bit) => {
			debug('toggle-event!', bit);
		});
	}
}

module.exports = TogglePlugin;
