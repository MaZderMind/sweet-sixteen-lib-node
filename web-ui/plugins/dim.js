let value = 100;

function setValue(input) {
	if(input < 0) input = 0;
	if(input > 100) input = 1;

	$value.text(input / 100);
	socket.emit('dim', input / 100);
	value = input;
}

const $plus  = $('<button>')
	.text('+')
	.on('click', function () {
		setValue(value + 10);
	});
const $minus = $('<button>')
	.text('-')
	.on('click', function () {
		setValue(value - 10);
	});
const $value = $('<span>').text(value);

$('<div>')
	.append($plus)
	.append($minus)
	.append($value)
	.prependTo('body');
