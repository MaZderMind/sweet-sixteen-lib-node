var value = 100;

function setValue(input) {
	if(input < 0) input = 0;
	if(input > 100) input = 100;

	$value.text(input+'%');
	socket.emit('dim', input / 100);
	value = input;
}

var $plus  = $('<button>')
	.text('+')
	.on('click', function () {
		setValue(value + 5);
	});
var $minus = $('<button>')
	.text('-')
	.on('click', function () {
		setValue(value - 5);
	});
var $value = $('<span>');

setValue(value);

$('<fieldset>')
	.append('<legend>Dim:</legend>')
	.append($plus)
	.append($minus)
	.append($value)
	.prependTo('body');
