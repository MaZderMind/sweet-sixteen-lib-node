const debug = require('debug')('sweet-sixteen:AnimatePlugin');

class AnimatePlugin {
	constructor() {
		this.frames = [];
		this.currentFrame = 0;
		this.playTimer = null;
		this.speed = 125;
	}

	setDriver(driver) {
		debug('registered');
		this.driver = driver;
	}

	beforeSetup() {
		debug('adding client-plugin');
		this.driver.addClientPlugin('animate');
	}

	onConnection(connection) {
		debug('binding event handler');
		connection.on('animate:store', () => {
			debug('storing frame');
			this.frames[this.currentFrame] = this.driver.api.lastTransmittedData.slice(0);
			this.currentFrame++;
			connection.emit('animate:currentFrame', this.currentFrame);
		});
		connection.on('animate:prev', () => {
			this.currentFrame--;
			if(this.currentFrame < 0) this.currentFrame = 0;
			const api = this.driver.api;
			api.transmit(this.frames[this.currentFrame])
				.then(() => api.latch())
				.then(() => {
					this.driver.io.emit('animate:currentFrame', this.currentFrame);
				})
		});
		connection.on('animate:next', () => {
			this.currentFrame++;
			if(this.currentFrame >= this.frames.length) this.currentFrame = this.frames.length-1;
			const api = this.driver.api;
			api.transmit(this.frames[this.currentFrame])
				.then(() => api.latch())
				.then(() => {
					this.driver.io.emit('animate:currentFrame', this.currentFrame);
				})
		});
		connection.on('animate:config', (speed) => {
			this.speed = speed;
		});
		connection.on('animate:start', () => {
			debug('starting playback');
			if(this.playTimer) return;
			this.playTimer = setTimeout(() => this.playNextFrame(), this.speed);
		});
		connection.on('animate:stop', () => {
			debug('stopping playback');
			if(!this.playTimer) return;
			clearTimeout(this.playTimer);
			this.playTimer = null;
		});
		connection.on('animate:clear', () => {
			clearTimeout(this.playTimer);
			this.playTimer = null;
			this.currentFrame = 0;
			this.driver.io.emit('animate:currentFrame', this.currentFrame);
			this.frames = [];
		});
	}

	playNextFrame() {
		this.currentFrame++;
		if(this.currentFrame >= this.frames.length) this.currentFrame = 0;
		debug('playing frame', this.currentFrame, this.frames[this.currentFrame]);
		const api = this.driver.api;
		api.transmit(this.frames[this.currentFrame])
			.then(() => api.latch())
			.then(() => {
				this.playTimer = setTimeout(() => this.playNextFrame(), this.speed);
				this.driver.io.emit('animate:currentFrame', this.currentFrame);
			});
	}
}

module.exports = AnimatePlugin;
