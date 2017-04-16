var $store  = $('<button>')
	.text('Store')
	.on('click', function () {
		socket.emit('animate:store');
	});
var $start = $('<button>')
	.text('Start')
	.on('click', function () {
		socket.emit('animate:start');
	});
var $stop = $('<button>')
	.text('Stop')
	.on('click', function () {
		socket.emit('animate:stop');
	});
var $next = $('<button>')
	.text('->')
	.on('click', function () {
		socket.emit('animate:next');
	});
var $prev = $('<button>')
	.text('<-')
	.on('click', function () {
		socket.emit('animate:prev');
	});
var $clear = $('<button>')
	.text('Clear')
	.on('click', function () {
		socket.emit('animate:clear');
		$frame.text('Frame #');
	});
var $frame = $('<span>')
	.text('Frame #');

$('<fieldset>')
	.append('<legend>Animate:</legend>')
	.append($store)
	.append($start)
	.append($stop)
	.append($prev)
	.append($next)
	.append($clear)
	.append($frame)
	.prependTo('body');

socket.on('animate:currentFrame', function (currentFrame) {
	$frame.text('Frame '+currentFrame);
});
