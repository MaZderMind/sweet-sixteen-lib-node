$( ".svg" ).svgToInline();

function update(state) {
	updateBoard(0, state.slice(0, 16));
}

function updateBoard(boardId, state) {
	var registerOrder = [
		0,1,2,3,
		7,6,5,4,
		8
	];

	for(var stateIndex = 0; stateIndex < registerOrder.length; stateIndex++) {
		updateRegister(boardId, registerOrder[stateIndex], state[stateIndex]);
	}
}

function bit(number, bitIndex) {
	return (number & (1 << bitIndex)) > 0;
}

function updateRegister(boardId, registerId, state) {
	if(registerId < 8) {
		var segmentOrder = [
			'g','t','s','u',
			'h','k','m','a',
			'b','n','c','p',
			'r','d','f','e',
		];

		for(var bitIndex = 0; bitIndex < segmentOrder.length; bitIndex++) {
			updateDisplaySegment(boardId, registerId, segmentOrder[bitIndex], bit(state, bitIndex));
		}
	}
	else {
		var dpOrder = [
			4, 5, 6, 0, 1, 2, 3, 7
		];
		for(var dpIndex = 0; dpIndex < 8; dpIndex++) {
			updateDisplaySegment(boardId, dpOrder[dpIndex], 'dp', bit(state, dpIndex));
		}
		for(var bitIndex = 8; bitIndex < 16; bitIndex++) {
			updateLed(boardId, 8-(bitIndex-7), bit(state, bitIndex));
		}
	}
}

function updateDisplaySegment(boardId, displayId, segmentId, enabled) {
	var $board = $('.board.b-'+boardId);
	var $display = $board.find('.d-'+displayId);
	var $segment = $display.find('#'+segmentId);
	$segment.toggleClass('enabled', enabled);
}
function updateLed(boardId, ledId, enabled) {
	var $board = $('.board.b-'+boardId);
	var $led = $board.find('.l-'+ledId);
	var $path = $led.find('path');
	$path.toggleClass('enabled', enabled);
}


var socket = io();
window.socket = socket;

$(function () {
	socket.on('setup', function (data) {
		data.clientPlugins.forEach(function (clientPlugin) {
			$.getScript('/plugins/'+clientPlugin+'.js');
		})
	});

	socket.on('update', function (data) {
		console.log('received update', data.state);
		update(data.state);
	});
});
